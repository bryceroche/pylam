import re


def clean_phone_no(a):
	a = re.sub('[-()!@+#$]', '', a)
	a = a.replace(' ', '')

	if len(a) < 10:
		return 0

	if len(a) == 10:
		return '+1' + a

	if len(a) == 11:
		if a[:1] == '+':
			return '+1' + a[:10]

		else:
			return '+' + a[:11]

	return a


print clean_phone_no('424-347-6845')
print clean_phone_no('(424)347-6845')
print 'a'
print clean_phone_no('1-424-347-6845')
print clean_phone_no('1-424-347-6845')
print 'a'
print clean_phone_no('(1) 424-347-6845')
print clean_phone_no('4243476845')

