import re
_p = re.compile(r'\d+(?:[-\u2013]\d+)+')
def wrap(s):
    return _p.sub(lambda m: '<bdi>' + m.group(0) + '</bdi>', s)
