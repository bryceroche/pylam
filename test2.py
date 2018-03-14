import datetime
from collections import namedtuple
from app import get_data
from rng import availability

#panel (when is everyone available for 1 hour for example)
#think of this as an inner join on two date ranges
#to see where everyone is available
#are mmg1 and mmg2 and mmg3 are all avail for example
def isdate(a):
	if (isinstance(a, datetime.datetime)):
		return True
	else:
		return False

def overlap_fn(ds1, de1, ds2, de2):
	if (isdate(ds1) and isdate(de1) and isdate(ds2) and isdate(de2)):
		Range = namedtuple('Range', ['start', 'end'])
		r1 = Range(start=ds1, end=de1)
		r2 = Range(start=ds2, end=de2)
		latest_start = max(r1.start, r2.start)
		earliest_end = min(r1.end, r2.end)

		overlapdays = (earliest_end - latest_start).days
		overlap = (earliest_end - latest_start).seconds/(60) 

		if(earliest_end < latest_start):
			overlap = -1

		return overlap, True, [latest_start, earliest_end, overlap]
	else:
		return False, 0

def setup(rng1, rng2):
	newarr = []
	for i in rng1:
		for a in rng2:
			m, n, o = overlap_fn(a[0], a[1], i[0], i[1])
			if(m>=0):
				newarr = newarr + [o]
	return newarr

def printstuff(rang):
	for a in rang:
		print a

def panel_meeting(mgr, interval):

	hours = [[] for a in mgr]
	interview = [[] for a in mgr]
	realavail = [[] for a in mgr]
	i = 0

	for a in mgr:
		print i
		hours[i] = get_data('sp_demo_manager_hours', [a, 0, interval])
		interview[i] = get_data('sp_get_mg_interview', [a])
		realavail[i] = availability(hours[i], interview[i], interval)
		i += 1

	i = 0
	arr = []
	for a in mgr:
		print i
		if (i==0):
			print 'do nothing first time around'
		elif (i==1):
			arr = setup(realavail[i-1], realavail[i])
		else:
			arr = setup(arr, realavail[i])
		i += 1
	return arr


printstuff(get_mmg([1,2,3], 20))









