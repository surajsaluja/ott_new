import { useEffect, useState, useCallback, useRef } from "react";
import { fetchAppFeatures } from "../../../Service/AuthService";
import { useFocusable, setFocus } from "@noriginmedia/norigin-spatial-navigation";
import * as MdIcons from "react-icons/md";
import {
  IoTv,
  IoTvOutline,
  IoHeartOutline,
  IoHeartSharp,
  IoSearchOutline,
  IoSearchSharp,
} from "react-icons/io5";
import { RiMovie2Line, RiMovie2Fill } from "react-icons/ri";
import { useHistory } from "react-router-dom";
import { CACHE_KEYS, getCache } from "../../../Utils/DataCache";

const useMenu = (activeTabId, focusKey) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(1);
  const [menuFocusMap, setMenuFocusMap] = useState({});
  const history = useHistory();

  const menu = [
    {
      id: 'HOME',
      text: "HOME",
      iconOutline: "MdOutlineHome",
      iconFill: "MdHome",
      permission: "isVODEnabled",
      redirect: "/home",
      categoryId: 5,
    },
    {
      id: 'MOVIES',
      text: "MOVIES",
      iconOutline: "RiMovie2Line",
      iconFill: "RiMovie2Fill",
      permission: "isVODEnabled",
      redirect: "/movies",
      categoryId: 1,
    },
    {
      id: 'WEB_SERIES',
      text: "WEB SERIES",
      iconOutline: "MdOutlineWebStories",
      iconFill: "MdWebStories",
      permission: "isWebseriesEnabled",
      redirect: "/webseries",
      categoryId: 2,
    },
    {
      id: 'LIVE_TV',
      text: "LIVE TV",
      iconOutline: "IoTvOutline",
      iconFill: "IoTv",
      permission: "isTVEnabled",
      redirect: "/liveTV",
      categoryId: 3,
    },
    {
      id: 'RADIO',
      text: "RADIO",
      iconOutline: "MdOutlineRadio",
      iconFill: "MdRadio",
      permission: "isRadioEnabled",
      redirect: "/radio",
      categoryId: 4,
    },
    {
      id: 'SEARCH',
      text: "SEARCH",
      iconOutline: "IoSearchOutline",
      iconFill: "IoSearchSharp",
      permission: "isVODEnabled",
      redirect: "/search",
      categoryId: 6,
    },
    {
      id: 'FAVOURITE',
      text: "FAVOURITES",
      iconOutline: "IoHeartOutline",
      iconFill: "IoHeartSharp",
      permission: "isVODEnabled",
      redirect: "/wishlist",
      categoryId: 7,
    },
    {
      id: 'PROFILE',
      text: "PROFILE",
      iconOutline: "MdPersonOutline",
      iconFill: "MdPerson",
      permission: "isVODEnabled",
      redirect: "/profile",
      categoryId: 8,
    },
  ];

  const {
    ref,
    focusKey: currentFocusKey,
    hasFocusedChild,
    focusSelf,
  } = useFocusable({
    focusable: true,
    trackChildren: true,
    focusKey,
    saveLastFocusedChild: true,
  });

  const menuScrollingRef = useRef(null);

  const onMenuFocus = useCallback(
    ({ y }) => {
      menuScrollingRef.current.scrollTo({
        top: y - 20,
        behavior: "smooth",
      });
    },
    [menuScrollingRef]
  );

  const onMenuEnterPress = useCallback(
    (item) => {
      setSelectedMenu(item.id);
      history.replace(item.redirect);
    },
    [selectedMenu, history]
  );

  const getAppFeatures = async () => {
    try {
      let features = {};
      const cached = getCache(CACHE_KEYS.MENU.MENU_DATA);
      if (cached) {
        features = cached;
      } else {
        const response = await fetchAppFeatures();
        if (response?.isSuccess && response?.data) {
          features = response.data;
        }
      }
      const filteredMenu = menu.filter((item) => features[item.permission]);
      setMenuItems(filteredMenu);
    } catch (error) {
      console.error("Failed to fetch app features:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (item) => {
    const IconKey = item.id == selectedMenu ? item.iconFill : item.iconOutline;
    const allIcons = {
      ...MdIcons,
      IoTv,
      IoTvOutline,
      IoHeartOutline,
      IoHeartSharp,
      IoSearchOutline,
      IoSearchSharp,
      RiMovie2Fill,
      RiMovie2Line,
    };
    const IconComp = allIcons[IconKey];
    return IconComp ? <IconComp /> : null;
  };

  useEffect(() => {
    const selectedMenuItem = menu.find(
      (item) => item.categoryId == activeTabId
    );
    if (selectedMenuItem) {
      setSelectedMenu(selectedMenuItem.id);
    }
  }, [activeTabId]);

  useEffect(() => {
    getAppFeatures();
  }, []);

  useEffect(() => {
        const newFocusMap = {};
        menu.forEach((item) => {
            newFocusMap[item.id] = `MENU_ITEM_${item.id}`;
        });
        setMenuFocusMap(newFocusMap);
    }, []);

    useEffect(() => {
  if (!loading && menuFocusMap[selectedMenu]) {
    setFocus(menuFocusMap[selectedMenu]);
  }
}, [loading, selectedMenu, menuFocusMap]);

  return {
    menuItems,
    loading,
    focusSelf,
    selectedMenu,
    onMenuEnterPress,
    ref,
    currentFocusKey,
    hasFocusedChild,
    menuScrollingRef,
    onMenuFocus,
    getIconComponent,
    menuFocusMap,
    setMenuFocusMap
  };
};

export default useMenu;
