import praw
import json
import pandas as pd
import os
import datetime
import calendar

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
                     limit=None,
                     start_of_month_epoch=None,
                     end_of_month_epoch=None,
                     currently_earliest_in_file=None):
    """
    Fetches the latest posts from a given subreddit.

    Args:
        subreddit_name (str): The name of the subreddit to fetch posts from.
        limit (int): The number of posts to fetch. Default is 10.

    Returns:
        list: A list of dictionaries containing post details.
    """
    print(f"Try to fetch {limit} posts from r/{subreddit_name}...")
    subreddit = reddit.subreddit(subreddit_name)
    posts = []
    counter = 0
    # Fetch the posts from the subreddit 
    for submission in subreddit.top(time_filter = "all"):
        # Check if the post is within the specified date range
        if start_of_month_epoch and submission.created_utc < start_of_month_epoch:
            continue
        if end_of_month_epoch and submission.created_utc > end_of_month_epoch:
            continue
        if currently_earliest_in_file and submission.created_utc > currently_earliest_in_file:
            continue        
        # Create a dictionary for each post, containing (id, title, score, num_comments, body, created_utc)
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
    # Define the target month
    target_month = "2025-03"

    # Get the start of the month
    start_of_month = datetime.datetime.strptime(target_month, "%Y-%m").replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Get the number of days in the target month
    _, days_in_month = calendar.monthrange(start_of_month.year, start_of_month.month)

    # Calculate the end of the month
    end_of_month = start_of_month.replace(day=days_in_month, hour=23, minute=59, second=59, microsecond=999999)

    print(f"Start of month: {start_of_month}")
    print(f"End of month: {end_of_month}")

    # Convert to epoch time
    start_of_month_epoch = int(start_of_month.timestamp())
    end_of_month_epoch = int(end_of_month.timestamp())

    # Get the earliest unix timestamp from the csv file of the target month
    earliest = None
    file_path = f"raw data/reddit_posts_wallstreetbets_{target_month}.csv"
    # If the csv file exists, read it and get the earliest unix timestamp
    if os.path.exists(file_path):
        df = pd.read_csv(file_path)
        earliest = df['created_utc'].min()
        # Convert to epoch time
        earliest = int(earliest)
        print(f"Earliest unix timestamp in the csv file: {earliest}")

    # PRAW
    subreddit_name = "wallstreetbets"
    # limit = 50000
    posts = get_reddit_posts(subreddit_name=subreddit_name,
                            # limit=limit,
                            start_of_month_epoch =start_of_month_epoch,
                            end_of_month_epoch=end_of_month_epoch,
                            currently_earliest_in_file=earliest)
    
    # Save the posts to a csv file
    df = pd.DataFrame(posts)
    # Check if the csv file exists, if not create it
    file_path = f"raw data/reddit_posts_{subreddit_name}_{target_month}.csv"
    if not os.path.exists(file_path) and len(posts) > 0:
        df.to_csv(file_path, index=False)
        print(f"Created new csv file: {file_path}")
        print(f"Saved {len(posts)} posts to {file_path}")
    # If the csv file exists, append to it
    elif os.path.exists(file_path) and len(posts) > 0:
        df.to_csv(file_path, mode='a', header=False, index=False)
        print(f"Appended {len(posts)} posts to {file_path}")
