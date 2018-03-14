import datetime
from collections import namedtuple
from app import get_data
from rng import availability
import copy

"""
 example of how to call this method

 #printstuff(or_full_join_method([1,2,3], 20))

 when is one person from a list available 
 think of this as an full join on two date ranges
 to see where at least one person is available
 requires the availability routine to find real available hours
 based on office hours and exisiting appointments

initial answer with mgr 1, 2 .... 8,9,11,18
Find all instances of overlap and log them to alist and blist
then pop then out with the post_overlap method
rinse and repeat

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

def pre_overlap(rng1, rng2):
	alist = []
	blist = []
	iloop1, icount1 = -1, -1
	merged = []
	for i in rng1:
		iloop1 += 1
		iloop2 = -1
		for a in rng2:
			iloop2 += 1
			m, n, o = overlap_fn(a[0], a[1], i[0], i[1])
			if(m>=0):
				icount1 += 1
				alist = alist + [iloop1]
				blist = blist + [iloop2]
				merged = merged + merge_function(a[0], a[1], i[0], i[1])

	return alist, blist, merged

def post_overlap(rng1, thelist):
	print 'post_overlap'
	mylist = sorted(list(set(thelist)))
	i = -1
	for a in mylist:
		i += 1
		rng1.pop(a-i)
	return rng1

def merge_function(ds1, de1, ds2, de2):
	Range = namedtuple('Range', ['start', 'end'])
	r1 = Range(start=ds1, end=de1)
	r2 = Range(start=ds2, end=de2)
	earliest_start = min(r1.start, r2.start)
	latest_end = max(r1.end, r2.end)
	return [[earliest_start, latest_end]]

def print_2d_stuff(rang):
	i = 0
	for a in rang:
		i+=1
		for b in a:
			print i, b

def printstuff(rang):
	for a in rang:
		print a

def or_full_join_method(mgr, interval):
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
	return_real_avail = copy.deepcopy(realavail)
	arr = []
	for a in mgr:
		print i
		if (i==0):
			print 'first loop'
			if(len(mgr)==1):
				return realavail[i], return_real_avail
		elif (i==1):
			alist, blist, merged = pre_overlap(realavail[i-1], realavail[i])		
			newarr1 = post_overlap(realavail[i-1], alist)
			newarr2 = post_overlap(realavail[i], blist)
			arr = sorted(dedup_multiD_list(merged) + newarr1 + newarr2)
		else:
			alist, blist, merged = pre_overlap(arr, realavail[i])		
			newarr1 = post_overlap(arr, alist)
			newarr2 = post_overlap(realavail[i], blist)
			arr = sorted(dedup_multiD_list(merged) + newarr1 + newarr2)
		i += 1
	print 'or_full_join return'
	return arr, return_real_avail

def dedup_multiD_list(newarr):
	#for example... 
	#newarr2=[['a',1],['b',2],['c',3],['c',3]]
	#this method would remove once instance of ['c',3]
	set(tuple(element) for element in newarr)
	return [list(t) for t in set(tuple(element) for element in newarr)]













