import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { setFocus } from "@noriginmedia/norigin-spatial-navigation";
import { showModal } from "../../Utils";

import Menu_Home from "../Menu_Home";
import ContentWithBanner from "../HomeContentWithBanner";
import LiveTvHome from "../LiveTv/HomePage";
import SearchScreen from '../SearchScreen'

import './index.css';
import RadioHome from "../Radio/HomePage";
import WishlistHome from "../Wishlist/HomePage";
import ProfileHomePage from "../Profile";
import Error404 from "../Error404";

const MovieHomePage = () => {
  const { category } = useParams();

  const [isSidebarOpen, setIsSideBarOpen] = useState(false);

  const categoryMap = {
    HOME: 5,
    MOVIES: 1,
    WEBSERIES: 2,
    LIVETV: 3,
    RADIO: 4,
    SEARCH: 6,
    WISHLIST: 7,
    PROFILE: 8,
  };

    const exitApplication = () =>{
    let tizen  = window.tizen;
    try{
     if (typeof tizen !== 'undefined' && tizen.application) {
      tizen.application.getCurrentApplication().exit();
    } else {
      console.warn('Tizen API is not available.');
    }
    }catch(error){
      console.error('error at exit application',error);
    }
  }

  const onBackPressHandler = () =>{
    showModal('Confirm Exit Application',
      'Are You Sure You Want To Exit The Application',
      [
        {label: 'Yes', action: exitApplication, className: 'primary'}
      ]
    )
  }

  const catId = category ? categoryMap[category.toUpperCase()] || 5 : 5;

  // useEffect(() => {
  //   setFocus("Menu_Abc"); // Keep focus on menu after mount
  // }, []);

  const renderContent = () => {
    if (["HOME", "MOVIES", "WEBSERIES"].includes(category?.toUpperCase())) {
      return <ContentWithBanner category={catId} />;
    } else if (category?.toUpperCase() === "SEARCH") {
      return <SearchScreen focusKey={'SEARCH_SCREEN'}/>
    } else if (category?.toUpperCase() === "LIVETV") {
      return <LiveTvHome focusKey={'LIVE_TV_HOME'} />
    } else if (category?.toUpperCase() === "WISHLIST") {
      return <WishlistHome focusKey={'WISHLIST_HOME_PAGE'} />;
    } else if (category?.toUpperCase() === "PROFILE") {
      return <ProfileHomePage focusKey={'PROFILE_HOME_PAGE'} />
    } else if (category?.toUpperCase() === "RADIO") {
      return <RadioHome focusKey={'RADIO_HOME'}/>;
    }else {
      return <ContentWithBanner category={5} />; // Default fallback
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", color: 'white' }}>
      <Menu_Home 
      activeTab={catId} 
      focusKey="Menu_Abc"
      setIsSideBarOpen={setIsSideBarOpen} />
      <div className={`content-area ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default MovieHomePage;
