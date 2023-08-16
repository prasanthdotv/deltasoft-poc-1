export class Header {
  header = {
    settingsMenu: [
      {
        title: 'Theme',
        expanded: false,
        children: [
          {
            title: 'Light'
          },
          {
            title: 'Dark'
          }
        ]
      }
    ],
    settingsIcon: {
      icon: 'cog',
      pack: 'font-awesome'
    },
    userMenu: [
      {
        title: 'Log out'
      }
    ],
    userInfo: {
      picture: 'assets/images/avatar.svg'
    },
    title: 'iCX Dashboards'
  };
}
