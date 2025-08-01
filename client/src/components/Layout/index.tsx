import React from "react";
import Navigation from "../Navigation";
import { LayoutContainer, MainContent } from "./styled-components";
import type { LayoutProps } from "./types";

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Navigation />
      <MainContent>{children}</MainContent>
    </LayoutContainer>
  );
};

export default Layout;
