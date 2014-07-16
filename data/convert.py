import json

world_json = json.load( open('world.json') )
region_json = json.load( open('regional.json'))

for feature in world_json['features']:
  region_id = feature['id']
  for one in region_json:
    if region_id == one['alpha-3']:
      region_code = one['alpha-2']
      feature['code'] = region_code
      break

with open('world.json', 'w') as outfile:
  json.dump(world_json, outfile)
