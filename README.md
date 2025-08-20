# RACING DIGITAL TECHNICAL TEST - DAVID ASUNMO

Bonjour bonjour!

Before I explain my solution, I want to preface this with the fact that this is first time using Angular, so there was a lot of leadup time in figuring out how to do things and fixing bugs before I actually got to the part where I could start solving the problem.

Due to this, alongside not wanting to spend too much time on this (as I was advised), I focused on the pragmatic approach of actually getting something working instead of trying to do things the best way. So if you see any messy, unclean, or unused code that perhaps has a quick and easy refactor, this is the reason it's still there.

* * *

## Ideal solution

Have jockey leaderboard with default rankings. Ranking algorithm config can be customizable. Although there's a ranking, want to display enough useful information for the user to make their own judgements on which jockey is the best, as the algorithm is not a definitive measure of jockey performance.

UI must also have table that shows all races, click race to see race details. Can make notes on the race that way.

Each table shown on screen must have a filter, ideally per column, where you click the little filter icon (like in Excel) and you can type in the filter, or there's a list of all items in the column with checkboxes for what you want to filter by.

Ranking has points mechanism: higher placing in race gets more points.

Ideal points mechanism:
  - points for being close to 1st place
  - Points for near win
  - points per place (1st = 3, 2nd = 2, 3rd = 1) can be customized
  - Distance of the race also taken into account, assuming that length of race can impact race results/performance (longer race ofc harder for the horse). \
  So races have distance buckets (e.g. 1000-1700, 1700-2200, 2200+), and can see which jockey is best for each distance (assuming enough data for this to be useful)
  - percentile finish (where place with respect to how many racers in the race)


Not yet implemented:
  - Customizable config
  - Proper layout, fine tuning, etc.
  - Didn't clean data for erroneous entries (jockey in race twice, invalid positions, etc.)
  - CSV file upload
  - Saving of notes per race
  - Race details showing non-tabular details in the header (date, race course, race distance)
  - Some other stuff I'm forgetting
