import { NavItem } from './types';

export const mockNavigation: NavItem[] = [
  {
    id: "1",
    title: "Dashboard",
    url: "/",
    visible: true,
  },
  {
    id: "2",
    title: "Job Applications",
    url: "/applications",
    visible: true,
    children: [
      {
        id: "2-1",
        title: "John Doe",
        url: "/applications/john-doe",
        visible: true
      },
      {
        id: "2-2",
        title: "James Bond",
        url: "/applications/james-bond",
        visible: false
      }
    ]
  },
  {
    id: "3",
    title: "Settings",
    url: "/settings",
    visible: true
  }
];