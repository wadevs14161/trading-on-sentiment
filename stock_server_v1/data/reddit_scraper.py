import praw
import json
import pandas as pd

# Read json file with reddit credentials
with open(".reddit_credentials.json", "r") as f:
    credentials = json.load(f)

# Initialize Reddit instance
reddit = praw.Reddit(
    client_id=credentials["client_id"],
    client_secret=credentials["client_secret"],
    user_agent=credentials["user_agent"],
    username=credentials["username"],
    password=credentials["password"],
)

def get_reddit_posts(subreddit_name,
                     limit=10
                     ):
    """
    Fetches the latest posts from a given subreddit.

    Args:
        subreddit_name (str): The name of the subreddit to fetch posts from.
        limit (int): The number of posts to fetch. Default is 2000.

    Returns:
        list: A list of dictionaries containing post details.
    """
    print(f"Try to fetch max. {limit} posts from r/{subreddit_name}...")
    subreddit = reddit.subreddit(subreddit_name)
    posts = []
    counter = 0
    # Fetch the posts from the subreddit 
    for submission in subreddit.new(limit=limit):
        post = {
            "id": submission.id,
            "title": submission.title,
            "score": submission.score,
            "num_comments": submission.num_comments,
            "body": submission.selftext,
            "created_utc": submission.created_utc,
        }
        posts.append(post)
        counter += 1
        print(f"Fetched {counter} posts...")

    print(f"Total posts fetched: {len(posts)}")       
    return posts


if __name__ == "__main__":
    # PRAW
    subreddit_name = "wallstreetbets"
    limit = 2000
    posts = get_reddit_posts(
        subreddit_name=subreddit_name,
        limit=limit
    )
    
    # Save the posts to a csv file
    df = pd.DataFrame(posts)
    output_file = f"reddit_posts_{subreddit_name}_latest.csv"
    df.to_csv(output_file, index=False)
    print(f"Posts saved to {output_file}")