import datetime
from collections import namedtuple
from app import get_data, insert_many_answer
import sys

"""
# think of this as an unmatched outer join
# basically subtract one date range from another
# pass in the office hours and existing schedule
# return the available or free hours where someone 
#is in office and doesn't have existing appointments


file rng2.py handles the (NOT or unmatched outer join)
file panel.py handles the (AND or inner join)
file or_full_join.py handles the (OR or full join)
file seq.py has the sequence file (5 consecutive interviews with one candidate for example)

"""

def overlap_fn(ds1, de1, ds2, de2):
	if (isdate(ds1) and isdate(de1) and isdate(ds2) and isdate(de2)):
		Range = namedtuple('Range', ['start', 'end'])
		r1 = Range(start=ds1, end=de1)
		r2 = Range(start=ds2, end=de2)
		latest_start = max(r1.start, r2.start)
		earliest_end = min(r1.end, r2.end)

		overlapdays = (earliest_end - latest_start).days
		overlap = (earliest_end - latest_start).seconds/(60*60) 

		if(earliest_end < latest_start):
			overlap = -1

		return True, [latest_start, earliest_end, overlap, overlapdays]
	else:
		return False, 0

def isdate(a):
	if (isinstance(a, datetime.datetime)):
		return True
	else:
		return False

def some_date_logic(a, ds1, de1, minint):
	if (a[3]<=0 and a[2]>=0):
		msg =  ' overlap  .. '
		if (ds1 == a[0]):
			return [[a[1], de1]]
		else:
			if((a[1] - de1).seconds/(60) > minint):
				return [[ds1, a[0]], [a[1], de1]]
			else:
				return [[ds1, a[0]]]
	else:
		return [[ds1, de1]]

def availability(navail, interv, minint):
	if not interv:
		newarr = []
		for a,b,c in navail:
			newarr.append([a,b])
		return gt_int(newarr, minint)

	x, y = 0, 0
	for i in interv:
		x += 1
		y=0
		avail = navail
		navail = []
		innerloop = len(avail)

		for k in range(innerloop):
			a = avail[y]
			y += 1

			yn, arr = overlap_fn(a[0], a[1], i[0], i[1])
			if (yn):
				j = some_date_logic(arr, a[0], a[1], minint)
				navail = navail + j

	#return add_col(gt_int(navail, minint), minint)

	return gt_int(navail, minint)

def gt_int(arr, intv_len):
	#want make sure the time returned is greater than the 
	# number of minutes interval given
	# for example... 
	#if you retrun less than 20 minutes it won't be worth mentioning
	arr2 = []
	for a in arr:
		minDiff = (a[1]-a[0]).seconds / 60
		if(minDiff>=intv_len):
			arr2 = arr2 + [a]
	return arr2

def add_col(newarr, minint):
	#add column to list subtract xxx minutes from end time
	return [x + [x[1] - datetime.timedelta(minutes=minint)] for x in newarr]

def printstuff(rang):
	for a in rang:
		print a

def rtn_2_of_3(arr):
	newarr = []
	for a, b, c in arr:
		newarr.append([a,b])

	return newarr


def build_arg(s1, s2, s3):
	s1 = s1.replace("[", "")
	s1 = s1.replace("]", "")
	s1 = s1.replace(",", "")
	s2 = s2.replace(",","")
	s3 = s3.replace(",","")

	return int(s1), int(float(s2)), int(s3)

def build_insert(arr, nodeid, mgr):
	newarr =[]	
	i = 0
	for a in arr:
		i += 1
		newarr.append([nodeid, mgr, i, a[0], a[1]])
	return newarr


def begin_here(s1=sys.argv[1], s2=sys.argv[2], s3=sys.argv[3]):
	#returns array with [managerid, start time, end time, solution id]
	# s1, s2, s3 = [1,2,3], 45, random_number

	mgr, int_len, random_number = build_arg(s1, s2, s3)

	hours = rtn_2_of_3(get_data('sp_demo_manager_hours', [mgr, 0, int_len]))
	inter =  get_data('sp_get_mg_interview', [mgr])
	newarr = availability(hours, inter, int_len)
	insertfinal = build_insert(newarr, random_number, mgr)
	insert_many_answer(insertfinal)
	
	sys.stdout.flush()
	
begin_here(sys.argv[1], sys.argv[2], sys.argv[3])


"""
def setup():
	minint = 20
	hours = rtn_2_of_3(get_data('sp_demo_manager_hours', [2, 0, minint]))
	inter =  get_data('sp_get_mg_interview', [2])
	newarr = availability(hours, inter, minint)
	
	printstuff(newarr)

setup()
"""



