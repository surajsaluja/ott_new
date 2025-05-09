import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { setFocus } from "@noriginmedia/norigin-spatial-navigation";

import Menu_Home from "../Menu_Home";
import ContentWithBanner from "./Content";

import './index.css';

const MovieHomePage = () => {
  const { category } = useParams();

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

  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%" }}>
      <Menu_Home activeTab={catId} focusKey="Menu_Abc" />
      <ContentWithBanner category={catId} />
    </div>
  );
};

export default MovieHomePage;
