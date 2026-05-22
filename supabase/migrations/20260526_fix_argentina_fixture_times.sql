-- Horarios oficiales FIFA (ET → UTC) para Argentina y final del Mundial 2026.

update public.matches
set
  date = '2026-06-17T01:00:00Z',
  venue = 'Arrowhead Stadium, Kansas City'
where id = 'm19';

update public.matches
set
  date = '2026-06-22T17:00:00Z',
  venue = 'AT&T Stadium, Dallas'
where id = 'm41';

update public.matches
set
  date = '2026-06-28T02:00:00Z',
  venue = 'AT&T Stadium, Dallas'
where id = 'm72';

update public.matches
set
  date = '2026-07-19T19:00:00Z',
  venue = 'MetLife Stadium, New York/New Jersey'
where id = 'm104';
