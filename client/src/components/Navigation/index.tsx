import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";
import {
  NavContainer,
  NavContent,
  BrandSection,
  BrandIcon,
  BrandText,
  NavLinks,
  NavLink,
  UserSection,
  UserInfo,
  UserName,
  Username,
  UserAvatar,
  LogoutButton,
  LogoutIcon,
} from "./styled-components";

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      navigate("/login");
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <NavContainer>
      <NavContent>
        {/* Brand Section */}
        <BrandSection>
          <Link to="/chat">
            <BrandIcon>MCP</BrandIcon>
            <BrandText>Shopping Assistant</BrandText>
          </Link>
        </BrandSection>

        {/* Navigation Links */}
        <NavLinks>
          <NavLink to="/chat" $isActive={isActive("/chat")}>
            💬 Chat
          </NavLink>

          <NavLink to="/api-keys" $isActive={isActive("/api-keys")}>
            🔑 API Keys
          </NavLink>

          {/* User Menu */}
          <UserSection>
            <UserInfo>
              <UserName>{user?.firstName}</UserName>
              <Username>@{user?.username}</Username>
            </UserInfo>

            <UserAvatar>{user?.firstName?.charAt(0) || "U"}</UserAvatar>

            <LogoutButton onClick={handleLogout} title="Logout">
              <LogoutIcon viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </LogoutIcon>
            </LogoutButton>
          </UserSection>
        </NavLinks>
      </NavContent>
    </NavContainer>
  );
};

export default Navigation;
