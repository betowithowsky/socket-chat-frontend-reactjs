import styled from "styled-components";

export const OnlineUserList = styled.div`
  font-weight: ${({ isSelected }) => (isSelected ? "bold" : "normal")};
`;

export const ChatContainer = styled.div`
    width: 80%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .chatHeader {
      display: flex;
      justify-content: space-between;
    }
    `
