from datetime import datetime
from collections import namedtuple
from app import get_data
from numpy import array
import pdb



def overlap_fn(ds1, de1, ds2, de2):
	if (isdate(ds1) and isdate(de1) and isdate(ds2) and isdate(de2)):
		Range = namedtuple('Range', ['start', 'end'])
		r1 = Range(start=ds1, end=de1)
		r2 = Range(start=ds2, end=de2)
		latest_start = max(r1.start, r2.start)
		earliest_end = min(r1.end, r2.end)

		overlapdays = (earliest_end - latest_start).days
		overlap = (earliest_end - latest_start).seconds/(60*60) 
		print ''

		if(earliest_end < latest_start):
			overlap = -1

		return True, [latest_start, earliest_end, overlap, overlapdays]
	else:
		return False, 0


def isdate(a):
	if (isinstance(a, datetime)):
		return True
	else:
		return False

def some_date_logic(a, ds1, de1):
	print 'in the some_date_logic'
	if (a[3]<=0 and a[2]>=0):
		msg =  ' overlap  .. '
		if (ds1 == a[0]):
			print msg + 'same start time'
			b = [[a[1], de1]]
			return b
		else:
			if((a[1] - de1).seconds/(60) >20):
				print msg + ' split'
				return [[ds1, a[0]], [a[1], de1]]
			else:
				print msg + ' nada split'
				b= [[ds1, a[0]]]
				return b

	else:
		print ' nada overlap '
		return [[ds1, de1]]



def setup():
	formater() 
	navail = get_data('sp_demo_manager_hours', [3, 0, 20])
	interv =  get_data('sp_get_mg_interview', [3])
	x, y = 0, 0

	for i in interv:
		x += 1
		y=0
		print ' outer loop ' + str(x)
		avail = navail
		navail = []
		innerloop = array(avail).shape[0]

		for k in range(innerloop):
			a = avail[y]
			y += 1
			print 'inner loop ..' + str(y)

			yn, arr = overlap_fn(a[0], a[1], i[0], i[1])
			if (yn):
				j = some_date_logic(arr, a[0], a[1])
				navail = navail + j


	print navail



def formater():
	print ""
	print ""
	print ""


def kd():
	a = ['a1', 'b1']
	b = ['a2', 'b2']
	c = []
	c.append(a)
	c.append(b)
	print array(c).shape
	
	d = ['a4', 'b4']
	e = ['a5', 'b5']
	f = []
	f.append(d)
	f.append(e)

	print array(f).shape

	k = []
	k.append(c)
	k.append(f)
	print array(k).shape

	j = c + f
	print array(j).shape

	j = j + c
	print array(j).shape

def dd():
	for x in range(1):
		print "We're on time %d" % (x)

setup()


















