import os 
import datetime
from collections import namedtuple
import sys
from app import get_data, insert_many_answer
from rng2 import availability

"""
example of how to call this method

 python seq.py [128204,4745,123687] 45 453


 sequence is consecutive interviews or round of interivews
file rng.py and rng2.py handle the (NOT or unmatched outer join)
file panel.py handles the (AND or inner join)
file or_full_join.py handles the (OR or full join)
file seq.py has the sequence file (5 consecutive interviews with one candidate for example)

"""

def printstuff(rang):
	for a in rang:
		print a   

def print_2d_stuff(rang):
	i = 0
	for a in rang:
		i+=1
		print ''
		for b in a:
			print b

def factorial(n):
	if n == 1:
		return 1
	else:
		return n * factorial(n-1)

def add_col(newarr, minint):
	#add column to list subtract xxx minutes from end time
	return [x + [x[1] - datetime.timedelta(minutes=minint)] for x in newarr]

def add_col_diff(newarr):
	#add column to list subtract xxx minutes from end time
	return [x + [td_minutes(x[1] - x[0])] for x in newarr]
	
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

def add_col_2d(arr):
	newarr = []
	for a in arr:
		newarr  = newarr + [add_col_diff(a, 0, 1)]
	return newarr

def format_duration(seconds):
	minutes, seconds = divmod(seconds, 60)
	hours, minutes = divmod(minutes, 60)
	return '{:02d}:{:02d}:{:02d}'.format(hours, minutes, seconds)

def long_enough2(rng, arr, int_len):
	for a in arr:
		if(long_enough(a, int_len)):
			start_time = rng[0] + datetime.timedelta(minutes = int_len)
			return True
	return False

def long_enough(rng, int_len):
	min_diff = td_minutes(rng[1] - rng[0])
	if(min_diff>= int_len):
		return True
	else:
		return False

def continious(arr, mgr):
	for i in range(len(mgr)-1):
		#print i, arr[i][1],'<=', arr[i+1][0]
		#de1 <= ds2 and de2 <= ds3 ...
		if (arr[i][1] <= arr[i+1][0]):
			return False
	return True

def td_minutes(td):
	return td.seconds/60


def find_time_thatworks(arr, total_len, icount):
	i = -1
	for a in arr:
		i += 1
		if(a[2]>total_len and i>= icount):
			return a

def does_it_work(otharr, ilen, int_len, iresult):
	arr1 = []
	arr2 = []
	i = 0 
	for a in otharr:
		i += 1
		m, n, o = overlap_fn(iresult[0], iresult[1], a[1][0], a[1][1])
		if (m>= int_len):
			arr1.append([a[1][0], a[1][1], a[0]])
			arr2.append(a[0])
	return arr1, arr2

def find_near_by(ds, de, ilen, int_len):
	ds1 = ds - datetime.timedelta(minutes = int_len * (ilen-1))
	de1 = de + datetime.timedelta(minutes = int_len * (ilen-1))

	return ds1, de1

def step2(arr, int_len, mgr):
	ilen = len(mgr)
	newarr = (c for a, b, c in arr if a == 1)
	otharr = list([a, c] for a, b, c in arr if a != 1) 
	#printstuff(otharr)

	arr_return = []

	for a in newarr:
		ds1, de1 = find_near_by(a[0], a[1], ilen, int_len)
		iresult = [ds1, de1]
		arr1, arr2 = does_it_work(otharr, ilen, int_len, iresult)
		arr2 = list(set(arr2))

		if (len(arr2) == ilen-1):
			arr1.append([a[0], a[1], 1])
			arr1 = sorted(arr1,key=lambda l:l[0])

			ck1 = continious(arr1, mgr)
			ck2 = each_mmg_has_time(arr1, int_len)
			ck3 = aggregate_mmgs_have_time(arr1, int_len, mgr)
			if(ck1 and ck2 and ck3):
				ds1 =  find_ds(arr1, mgr, int_len)
				arr_return.append(final_arrange(arr1, int_len, mgr, ds1))	
				#break		
	print ''
	return arr_return
			
def find_ds(arr, mgr, int_len):
	# max(ds1, ds2 - int_len*1 )
	# max(ds1, ds3 - int_len*2)
	# ...
	ds1 = arr[0][0]
	for i in range(len(mgr)-1):
		ds2 = arr[i+1][0] - datetime.timedelta(minutes = (int_len*(i+1)))
		ds1 = max(ds1, ds2)
	return ds1

def final_arrange(arr, int_len, mgr, ds1): # come back here........
	hours = []
	ds = ds1
	de = ds1 + datetime.timedelta(minutes = int_len)

	#print arr, int_len, mgr, ds1

	for i in range(len(mgr)):
		hours.append([mgr[i], ds, de]) 
		ds = de
		de = ds + datetime.timedelta(minutes = int_len)
	return hours

def each_mmg_has_time(arr, int_len):
	for a in arr:
		if(td_minutes(a[1] - a[0]) < int_len ):
			return False
	return True
	
def aggregate_mmgs_have_time(arr, int_len, mgr):
	duration_min = td_minutes(arr[len(mgr)-1][1] - arr[0][0])
	if (duration_min < (int_len * len(mgr))):
		return False
	return True


def get_each_available(mgr, interval):
	hours = [[] for a in mgr]
	interview = [[] for a in mgr]
	realavail = [[] for a in mgr]
	i = 0

	for a in mgr:
		hours[i] = get_data('sp_demo_manager_hours', [a, 0, interval])
		interview[i] = get_data('sp_get_mg_interview', [a])
		realavail[i] = add_col_manager(availability(hours[i], interview[i], interval), a)
		i += 1

	i = 0
	return realavail 

def add_col_manager(arr, mgrid):
	newarr = []
	for a in arr:
		newarr.append([a[0], a[1], mgrid])
	return newarr

def create_long_enough(arr, int_len):
	arr2 =[]
	i = 0
	j = 0
	for a in arr:
		i += 1
		for b in a:
			if (long_enough(b, int_len)):
				j += 1
				arr2.append([i, j, b])
			else:
				print 'knocked out bc not long enough', b, int_len, i
	print '..'
	return arr2

def build_arg(s1, s2, s3):
	s1 = s1.replace("[", "")
	s1 = s1.replace("]", "")
	s1 = [x.strip() for x in s1.split(',')]
	s1 = map(int, s1)
	s2 = s2.replace(",","")
	s3 = s3.replace(",","")
	return s1, int(float(s2)), int(s3)

def build_insert(arr, nodeid):
	newarr =[]	
	for a in arr:
		newarr.append([nodeid, a[0], a[3], a[1], a[2]])
	return newarr

def final_validation(arr_sol, each_avail):
	newarr = []
	i = 0 
	for a in arr_sol:
		i += 1
		for b in a:
			newarr.append(final_part2(b, each_avail, i))
	return newarr

def final_part2(b, each_avail, i):
	#b = row solution
	# matching solution row to source row 
	# confirm that solution row lines inside source row bounds
	# and confirm that you are using the right mmg #
	# each_avail = [1, 1, [datetime.datetime(2018, 2, 23, 7, 30), datetime.datetime(2018, 2, 23, 15, 30), 128204]]
	#  b (solution) = [128204, datetime.datetime(2018, 3, 1, 9, 0), datetime.datetime(2018, 3, 1, 9, 45)] 10
	for a in each_avail:
		if(b[0]== a[2][2] and b[1]>= a[2][0] and b[2]<= a[2][1]):
			b.append(i)
			return b
	return 0

def begin_here(s1=sys.argv[1], s2=sys.argv[2], s3=sys.argv[3]):
	#returns array with [managerid, start time, end time, solution id]
	# s1, s2, s3 = [1,2,3], 45, random_number

	mgr, int_len, random_number = build_arg(s1, s2, s3)
	each_avail = get_each_available(mgr, int_len)
	each_avail =  create_long_enough(each_avail, int_len)
	solution = step2(each_avail, int_len, mgr) #issue with step2 managerid is becoming [1,2,2] instead of [1,2,3] 
	final_answer = final_validation(solution, each_avail)
	insertfinal = build_insert(final_answer, random_number)
	insert_many_answer(insertfinal)
	
	sys.stdout.flush()
	
begin_here(sys.argv[1], sys.argv[2], sys.argv[3])




