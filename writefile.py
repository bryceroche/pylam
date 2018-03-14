

def writefile(filename):
	f= open(filename,"w+")
	for i in range(10):
		f.write("This is line %d\r\n" % (i+1))
	f.close() 

writefile('abc.txt')