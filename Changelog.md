## 3.2.0:
- Major Refactoring of MessageButtonUtils.ts
- Fixed formatting on all files
- Reverted bot to not using shards due to difficulties fixing bugs, potentially will in the future go back to being sharded
- Fixed embeds having [object Object] when they have a footer and get get a new footer from createMessageEmbed
- Added Rock Paper Scissors
- levels.ts major revamp
- Card revamp
- Added wings
- Allowed users to disable pings from leveling up
- Allowed users to disable name in card
- Updated Discord.js to 13.6.0

## 3.1.1:
- MinigameUtils.ts updated to allow for a minimum amount of players
- Updated MinigameUtils.ts to give feedback to when clicking buttons
- Updated tictactoe.ts to give feedback to the user they can't play where a player has already played
- Added more activities
- Reintroduction of lines folder
- Updated Discord.js to 13.2.0
- Fixed crash when trying to get User

## 3.1.0:
- Updated Discord.js
- User Settings are now global
- getGuildByID -> getGuildById for naming consistency
- Slight improvements to levels.ts
- CanvasUtils.ts/roundRect allow for other types of operations
- Moved canvas related function to CanvasUtils.ts
- Removed redundant options from BotOptions
- Added American spelling for customisation to Customisation Category, as well as some customisation commands
- XPUtils now has a parser class
- Moved some commands to their own folder to match their categories
- Increased consistency
- CommandAvailability -> CommandAvailable
- Fixed localisation issues
- MinigameUtils.ts created