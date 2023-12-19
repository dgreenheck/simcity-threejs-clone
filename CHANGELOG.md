# 1.1.0
The focus for this update was refactoring logic for tiles and zones into attributes. For example, the logic controlling the zone development state machine is now encapsulated in `DevelopmentAttribute`. The motivation behind this was to break simulation behaviors into small, composable chunks that can be re-used between different building types. The zone classes were beginning to turn into spaghetti code as the behaviors became more intertwined. This makes the code easier to reason about and more testable, and facilitates adding additional tile/building attributes in the future (power, water, crime, pollution, etc.)

## Updates

- Added new cars
- Added new model when buildings are under construction
- Added new zone attributes
  - `DevelopmentAttribute` - Logic for the zone development state machine
  - `JobsAttribute` - Logic for industrial/commerical jobs
  - `ResidentsAttribute` - Logic for citizens moving in/out of residenial buildings
- Reorganized files into a more logical structure

## Fixes

- Fixed cars not having shadows
- Fixed some car types not spawning
- Fixed cars not spawning as frequently as they should (due to above issue)
- Fixed cars driving off roads when laying new road tiles
- Fixed asset scaling issues
- Fixed map not appearing until mouse move event was called

# 1.0.0
- Initial Release