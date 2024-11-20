import * as Io5Icons from 'react-icons/io5';
import * as IoIcons from 'react-icons/io';
import { MdDownloadForOffline } from 'react-icons/md';

const SidebarData = [
  {
    title: 'Library',
    path: '/',
    icon: <Io5Icons.IoLibrary />,
    className: 'nav-text',
  },
  {
    title: 'Add Series',
    path: '/addSeries',
    icon: <IoIcons.IoMdAddCircle />,
    className: 'nav-text',
  },
  {
    title: 'Downloads',
    path: '/downloads',
    icon: <MdDownloadForOffline />,
    className: 'nav-text',
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <IoIcons.IoMdSettings />,
    className: 'nav-text',
  },
];
export default SidebarData;
