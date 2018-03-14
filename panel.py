import datetime
from collections import namedtuple
from app import get_data, insert_many_answer
from rng2 import availability, insert_many_answer
import sys
"""
example of how to call this method

#printstuff(panel_meeting([1,2], 20))

# panel (when is everyone available for 1 hour for example)
# think of this as an inner join on two date ranges
# to see where everyone is available
# are mmg1 and mmg2 and mmg3 are all avail for example
# requires the availability routine to find real available hours
# based on office hours and exisiting appointments


file rng.py and rng2.py handle the (NOT or unmatched outer join)
file panel.py handles the (AND or inner join)
file or_full_join.py handles the (OR or full join)
file seq.py has the sequence file (5 consecutive interviews with one candidate for example)

"""

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

def build_insert(arr, nodeid, mgr):
	newarr =[]	
	if(len(mgr)>1):
		mgr = -1

	i = 0
	for a in arr:
		i += 1
		newarr.append([nodeid, mgr, i, a[0], a[1]])
	return newarr

def panel_meeting(mgr, interval):

	hours = [[] for a in mgr]
	interview = [[] for a in mgr]
	realavail = [[] for a in mgr]
	i = 0

	for a in mgr:
		print i, a
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

def build_arg(s1, s2, s3):
	s1 = s1.replace("[", "")
	s1 = s1.replace("]", "")
	s1 = [x.strip() for x in s1.split(',')]
	print s1, s2, s3
	s1 = map(int, s1)
	s2 = s2.replace(",","")
	s3 = s3.replace(",","")

	return s1, int(float(s2)), int(s3)
#printstuff(panel_meeting([1,2,3], 100))

def begin_here(s1=sys.argv[1], s2=sys.argv[2], s3=sys.argv[3]):
	#returns array with [managerid, start time, end time, solution id]
	# s1, s2, s3 = [1,2,3], 45, random_number

	mgr, int_len, random_number = build_arg(s1, s2, s3)
	newarr = panel_meeting(mgr, int_len)
	insertfinal = build_insert(newarr, random_number, mgr)
	#printstuff(insertfinal)
	insert_many_answer(insertfinal)
	sys.stdout.flush()


begin_here(sys.argv[1], sys.argv[2], sys.argv[3])

















