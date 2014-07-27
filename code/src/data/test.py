import ijson

f = open('world.json')
parser = ijson.parse(f)
for prefix, event, value in parser:
	if (prefix, event) == ('features.item.properties.name', 'string'):
		print value
	if (prefix, event) == ('features.item.geometry.coordinates', 'start_array'):
		print 'start'
	if (prefix, event) == ('features.item.geometry.coordinates', 'end_array'):
		print 'end'
	if (prefix, event) == ('features.item.geometry.coordinates.item.item', 'start_array'):
		print '['
	if (prefix, event) == ('features.item.geometry.coordinates.item.item', 'end_array'):
		print ']'
	if (prefix, event) == ('features.item.geometry.coordinates.item.item.item', 'number'):
		print value
	# if prefix == 'features.item.geometry.coordinates.item.item.item':
	# 	print event

# objects = ijson.items(f, 'features.item')
# for one in objects:
# 	print one