import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { setFocus } from "@noriginmedia/norigin-spatial-navigation";

import Menu_Home from "../Menu_Home";
import ContentWithBanner from "../HomeContentWithBanner";
import LiveTvHome from "../LiveTv/HomePage";

import './index.css';

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

  const catId = category ? categoryMap[category.toUpperCase()] || 5 : 5;

  useEffect(() => {
    setFocus("Menu_Abc"); // Keep focus on menu after mount
  }, []);

  const renderContent = () => {
    if (["HOME", "MOVIES", "WEBSERIES"].includes(category?.toUpperCase())) {
      return <ContentWithBanner category={catId} />;
    } else if (category?.toUpperCase() === "SEARCH") {
      return <div>SEARCH</div>;
    } else if (category?.toUpperCase() === "LIVETV") {
      return <LiveTvHome focusKey={'LIVE_TV_HOME'} />
    } else if (category?.toUpperCase() === "WISHLIST") {
      return <div>WISHLIST</div>;
    } else if (category?.toUpperCase() === "PROFILE") {
      return <div>PROFILE</div>;
    } else {
      return <div>Coming Soon...</div>; // Default fallback
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
