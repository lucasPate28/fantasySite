from nhlpy import NHLClient
import pandas as pd
from datetime import datetime, timedelta
from scipy.stats import binom

NHL_TEAM_IDS = {"ANA": 0, "BOS": 1, "BUF": 2, "CAR": 3, "CBJ": 4, "CGY": 5, "CHI": 6, "COL": 7, "DAL": 8, "DET": 9, "EDM": 10, "FLA": 11, "LAK": 12, "MIN": 13, "MTL": 14, "NJD": 15, "NSH": 16, "NYI": 17, "NYR": 18, "OTT": 19, "PHI": 20, "PIT": 21, "SEA": 22, "SJS": 23, "STL": 24, "TBL": 25, "TOR": 26, "UTA": 27, "VAN": 28, "VGK": 29, "WPG": 30, "WSH": 31} 
REVERSED_NHL_TEAM_IDS = {v: k for k, v in NHL_TEAM_IDS.items()}
client = NHLClient()
teamGameTotal = [0] * 32
totalGames = [0] * 7
rows, cols = 32, 7
teamsGamesOnDay = [[0 for _ in range(cols)] for _ in range(rows)]
def prob_open_spot(roster_size, games_today):
    p = games_today / 16
    return binom.cdf(roster_size - 1, n=roster_size, p=p)
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
                teamGameTotal[NHL_TEAM_IDS[g["homeTeam"]["abbrev"]]] += 1
                teamGameTotal[NHL_TEAM_IDS[g["awayTeam"]["abbrev"]]] += 1
                totalGames[i] += 1
                teamsGamesOnDay[NHL_TEAM_IDS[g["homeTeam"]["abbrev"]]][i] += 1
                teamsGamesOnDay[NHL_TEAM_IDS[g["awayTeam"]["abbrev"]]][i] += 1
        except Exception:
            continue
    return pd.DataFrame(all_games)
 
def to_json(df):
    df.to_json("weekly_games.json", orient="records", indent=2)
def createTeamPickupValue(team, offDaySens=0.4):
    #creates the value of pickups for a selected team
    teamValue = 0
    for i in range(7):
        offNight = totalGames[i]/16 < offDaySens
        if teamsGamesOnDay[team][i] > 0:
            teamValue += prob_open_spot(2,totalGames[i])
    return teamValue
def pickup_values() -> pd.DataFrame:
    """Returns a DataFrame of every team and their pickup value."""
    
    rows = []
    for i in range(32):
        rows.append({
            "team": REVERSED_NHL_TEAM_IDS[i],
            "pickup_value": createTeamPickupValue(i),
        })
    return pd.DataFrame(rows)




df = weekly_games(start_date="2026-03-08")
to_json(df)
print(f"Saved {len(df)} games to weekly_games.json")
bf = pickup_values()
bf.to_json("pickup_values.json", orient="records", indent=2)
print(f"Saved {len(bf)} teams to pickup_values.json")
print(teamGameTotal)
print(teamsGamesOnDay)
print(totalGames)
print(createTeamPickupValue(1))
