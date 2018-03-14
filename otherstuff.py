iresult = [[0, 0] for a in range(ilen)]
min_ds =  min(ds for ds, de in arr)
hours = [[] for a in mgr]

newarr = (c for a, b, c in arr if a == 1)
def find_near_by(start_time, ilen, int_len):
	arr = []
	icount = 0
	for i in range(ilen-1):
		icount += 1
		arr.append(start_time + datetime.timedelta(minutes = int_len * icount)) 

	icount = 0
	for i in range(ilen-1):
		icount += 1
		arr.append(start_time + datetime.timedelta(minutes = int_len * icount * -1)) 

	arr.append(start_time)
	return arr

		
def feb9(arr):
	bryce_date = datetime.datetime.strptime('2/9/2018', '%m/%d/%Y')
	good_date = []
	for d in arr:
		if (d[0].date() == bryce_date.date()):
			good_date.append(d)
	return good_date

def feb9_2d(arr):
	bryce_date = datetime.datetime.strptime('2/9/2018', '%m/%d/%Y')
	good_date = []

	for a in arr:
		for d in a:
			if (d[0].date() == bryce_date.date()):
				good_date.append(d)
	return good_date


def get_the_seq(arr1, arr2, total_len):
	i = 0
	for a in arr2:
		i += 1
		print i
		if (i==2):
			for b in a:
				for c in arr1:
					m, n, o = overlap_fn(b[0], b[1], c[0], c[1])
					if(m>=total_len):
						print i, o

all_avail = feb9(all_avail)
each_avail = feb9_2d(each_avail)

printstuff(each_avail)


[10, 12, 12]
[
[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], 
[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11], 
[2, 3], [2, 4], [2, 7], [2, 8], [2, 10], [2, 11]
]



	now = datetime.datetime.now()
	newarr2 = map(list, zip(*newarr))
	for a in newarr2:
		print '....'
		print min(dt for dt in a if dt > now)


	printstuff(newarr2)
					start_time1 = b[0]
				start_time2 = start_time1 + datetime.timedelta(minutes = int_len)
				start_time3 = start_time2 + datetime.timedelta(minutes = int_len)

def step2(arr, int_len):
	i = 0
	newarr = []
	for a in arr:
		i+=1
		print len(a)
		newarr.append(add_col_diff(a))

	print_2d_stuff(newarr)