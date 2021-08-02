# run at 1 minute after the hour

from datetime import datetime, timedelta
import blaseball_mike.chronicler.v1 as chron_v1
import requests_cache
import json
from collections import defaultdict

START_SEASON = 14

session = requests_cache.CachedSession('chron_v2')

def cache_chron_v2(params):
    return session.get('https://api.sibr.dev/chronicler/v2/entities', params=params).json()['items']

def time2s(t):
    return datetime.strftime(t, "%Y-%m-%dT%H:%M:%S.%fZ")

start_times = defaultdict(dict)
time_map = chron_v1.time_map()
for day in time_map:
    if day['season'] >= START_SEASON-1:
        start_times[day['season']][day['day']] = day['startTime']

data = []

fields = ['level', 'eDensity', 'imPosition']

for season, starts in sorted(start_times.items()):
    assert set(starts) == set(range(len(starts))), f'season ${season} not contiguous!'
    teams = defaultdict(list)
    noodles = []

    for day, start in sorted(starts.items()):
        if season == 21-1 and day == 83-1:
            team_delta = 30 # oops siesta broke stuff
        else:
            team_delta = 5
        for team in cache_chron_v2({"type": "team", 'at':time2s(start+timedelta(minutes=team_delta))}):
            team = team['data']
            if 'stadium' in team and team['stadium'] != None:
                filtered_team = { field: team[field] for field in fields if field in team and team[field] != None }
                # Check scattered names first, then default
                nickname = team.get('state', {}).get('scattered', {}).get('nickname', team['nickname'])
                teams[nickname].append(filtered_team)
        idols = cache_chron_v2({'type': "idols", 'at':time2s(start), 'count':1})[0]
        noodle = idols['data']['data']['strictlyConfidential']
        noodles.append(noodle)
        print(season, day, noodle)
    data.append({'teams': dict(sorted(teams.items())), 'noodles': noodles})

with open('data.json','w') as f:
    json.dump(data, f)
