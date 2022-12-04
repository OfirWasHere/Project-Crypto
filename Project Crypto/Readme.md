
Hello!,
my app is all about Crypto!

How to use it:

1. In 'Currencies' Page you are able to select up-to 5 tokens of crypto that you can view the live pricing per unit of them in the 'Reports' page.
   you can press 'More Info' button in order to see more details about that coin.
   Search bar is not key sensitive just type whatever coin you are looking for!

2. Things I want you to know
   the page is fully responsive for both mobile and desktop, I built it from 0 without the usage of Bootstrap.

3. Side-note I tried my best to make the code readable and understandable, thank you for your time!.

- It takes around 3 seconds to load the Chart after entering live Reports page, The coins do update their pricing and you can see it on the live graph.

- Use Remove selection Button to Remove all Selected Coins (including from localStorage).

- I have purposely disabled Parallax effect on full screen, it will only start working if user need to scroll down. (on mobile for example)

- The reason why the nav is so big on the smallest size window and takes around 60% of the screen is because its meant for mobile 

- Every 2 minutes if the user has been idling for 2 minutes (or has not requested/triggered 'More Info' button) the localStorage will be refreshed with new request from api.
  (old data of LocalStorage will be overwritten)

in extreme case 
- If user manages to add more than 5 coins (by refreshing for example) cancel button will remove all of the latest selected coins(modal popup).
- as well if user selects more than 5 coins and goes to live reports page, the latest added coins will be removed. 