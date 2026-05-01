from nhlpy import NHLClient
import pandas as pd
from datetime import datetime, timedelta
 
client = NHLClient()
 
def weekly_games(start_date=None):
    """
    Fetch 7 days of games starting from the Monday of the current week.
    Pass any date string like "2026-04-21" to start from a specific Monday.
    """
    if start_date:
        start = datetime.strptime(start_date, "%Y-%m-%d")
    else:
        today = datetime.today()
        start = today - timedelta(days=today.weekday())  # rewind to Monday
 
    all_games = []
    for i in range(7):
        date = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        try:
            day_data = client.schedule.daily_schedule(date)
            for g in day_data.get("games", []):
                all_games.append({
                    "date":       date,
                    "away":       g["awayTeam"]["abbrev"],
                    "home":       g["homeTeam"]["abbrev"],
                    "start_time": g["startTimeUTC"],
                    "state":      g["gameState"],
                    "away_score": g["awayTeam"].get("score"),
                    "home_score": g["homeTeam"].get("score"),
                })
        except Exception:
            continue
    return pd.DataFrame(all_games)
 
def to_json(df):
    df.to_json("weekly_games.json", orient="records", indent=2)
 
df = weekly_games()
to_json(df)
print(f"Saved {len(df)} games to weekly_games.json")
