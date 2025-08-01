import styled from "styled-components";
import { Link } from "react-router-dom";

export const NavContainer = styled.nav`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
`;

export const NavContent = styled.div`
  max-width: 1536px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
`;

export const BrandSection = styled.div`
  display: flex;
  align-items: center;

  a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
  }
`;

export const BrandIcon = styled.div`
  width: 2rem;
  height: 2rem;
  background: #2563eb;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
`;

export const BrandText = styled.span`
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
`;

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

export const NavLink = styled(Link)<{ $isActive: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;

  ${({ $isActive }) =>
    $isActive
      ? `
        background: #dbeafe;
        color: #1d4ed8;
      `
      : `
        color: #4b5563;
        &:hover {
          color: #111827;
          background: #f3f4f6;
        }
      `}
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 0.75rem;
  border-left: 1px solid #e5e7eb;
`;

export const UserInfo = styled.div`
  text-align: right;
`;

export const UserName = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
`;

export const Username = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
`;

export const UserAvatar = styled.div`
  width: 2rem;
  height: 2rem;
  background: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  padding: 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #6b7280;
  }
`;

export const LogoutIcon = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
  fill: none;
  stroke: currentColor;
`;
