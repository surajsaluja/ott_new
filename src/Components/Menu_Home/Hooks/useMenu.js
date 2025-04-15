import { useEffect, useState, useCallback, useRef } from "react";
import { fetchAppFeatures } from "../../../Service";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import * as MdIcons from 'react-icons/md'
import { IoTv,IoTvOutline,IoHeartOutline,IoHeartSharp, IoSearchOutline,IoSearchSharp  } from "react-icons/io5";
import { RiMovie2Line, RiMovie2Fill } from "react-icons/ri";

const useMenu = (focusKey) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu,setSelectedMenu] = useState(1);

  const menu = [
    {
      id: 1,
      text: "HOME",
      iconOutline: "MdOutlineHome",
      iconFill: "MdHome",
      permission: "isVODEnabled",
      redirect: "/home",
    },
    {
      id: 2,
      text: "MOVIES",
      iconOutline: "RiMovie2Line",
      iconFill: "RiMovie2Fill",
      permission: "isVODEnabled",
      redirect: "/movies",
    },
    {
      id: 3,
      text: "WEB SERIES",
      iconOutline: "MdOutlineWebStories",
      iconFill: "MdWebStories",
      permission: "isWebseriesEnabled",
      redirect: "/webseries",
    },
    {
      id: 4,
      text: "LIVE TV",
      iconOutline: "IoTvOutline",
      iconFill: "IoTv",
      permission: "isTVEnabled",
      redirect: "/liveTV",
    },
    {
      id: 5,
      text: "RADIO",
      iconOutline: "MdOutlineRadio",
      iconFill: "MdRadio",
      permission: "isRadioEnabled",
      redirect: "/radio",
    },
    {
      id: 6,
      text: "SEARCH",
      iconOutline: "IoSearchOutline",
      iconFill: "IoSearchSharp",
      permission: "isVODEnabled",
      redirect: "/search",
    },
    {
      id: 7,
      text: "FAVOURITES",
      iconOutline: "IoHeartOutline",
      iconFill: "IoHeartSharp",
      permission: "isVODEnabled",
      redirect: "/wishlist",
    },
    {
      id: 8,
      text: "PROFILE",
      iconOutline: "MdPersonOutline",
      iconFill: "MdPerson",
      permission: "isVODEnabled",
      redirect: "/profile",
    },
  ];

  const { ref, focusKey: currentFocusKey, hasFocusedChild, focusSelf } = useFocusable({
          focusable: true,
          trackChildren: true,
          focusKey,
          saveLastFocusedChild: true
      });
  
      const menuScrollingRef = useRef(null);
  
      const onMenuFocus  = useCallback((({y})=>{
          menuScrollingRef.current.scrollTo({
              top: y - 20,
              behavior: 'smooth'
          });
      }),[menuScrollingRef]);
  
      const onMenuEnterPress = useCallback((item) => {
        setSelectedMenu(item.id);
      }, []);

  const getAppFeatures = async () => {
    try {
      const response = await fetchAppFeatures();
      if (response?.isSuccess && response?.data) {
        const features = response.data;
        const filteredMenu = menu.filter((item) => features[item.permission]);
        setMenuItems(filteredMenu);
      }
    } catch (error) {
      console.error("Failed to fetch app features:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent  = (item) =>{
    const IconKey =  item.id == selectedMenu ? item.iconFill : item.iconOutline;
    const allIcons = {...MdIcons, IoTv, IoTvOutline,IoHeartOutline,IoHeartSharp,IoSearchOutline,IoSearchSharp,RiMovie2Fill,RiMovie2Line};
    const IconComp = allIcons[IconKey];
    return IconComp ? <IconComp /> : null
  }

  useEffect(() => {
    getAppFeatures();
  }, []);

  return { menuItems, loading, focusSelf, selectedMenu, onMenuEnterPress, ref, currentFocusKey, hasFocusedChild,menuScrollingRef, onMenuFocus, getIconComponent };
};

export default useMenu;
