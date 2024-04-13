import styled from "styled-components";

export const LoadWrapper = styled.div`
  width: 100%;
  height: 100%;

  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;

  .loadstr {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #35c4f0;
    font-family: Helvetica, Arial, sans-serif;
    z-index: 10;
    letter-spacing: 2px;
    font-size: 25px;
    /* font-weight: bold; */
  }

  .loading {
    position: relative;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: linear-gradient(#14ffe9, #ffeb3b, #ff00e0);
    animation: loading 0.5s linear infinite;
  }

  .loading:before {
    content: "";
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border-radius: 50%;
    background-color: #000;
    z-index: 1;
  }

  .loading span {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(#14ffe9, #ffeb3b, #ff00e0);
  }

  .loading span:nth-child(1) {
    filter: blur(5px);
  }

  .loading span:nth-child(2) {
    filter: blur(10px);
  }

  .loading span:nth-child(3) {
    filter: blur(25px);
  }

  .loading span:nth-child(4) {
    filter: blur(50px);
  }

  @keyframes loading {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .loadstr > span {
    opacity: 1;
  }

  .loadstr > span:first-of-type {
    animation: letterFade 3s ease-in-out infinite;
    animation-delay: 0.1s;
  }

  .loadstr > span:nth-of-type(2) {
    animation: letterFade 3s ease-in-out infinite;
    animation-delay: 0.3s;
  }

  .loadstr > span:nth-of-type(3) {
    animation: letterFade 3s ease-in-out infinite;
    animation-delay: 0.5s;
  }

  .loadstr > span:nth-of-type(4) {
    animation: letterFade 3s ease-in-out infinite;
    animation-delay: 0.7s;
  }

  .loadstr > span:nth-of-type(5) {
    animation: letterFade 3s ease-in-out infinite;
    animation-delay: 0.7s;
  }

  .loadstr > span:nth-of-type(6) {
    animation: letterFade 3s ease-in-out infinite;
    animation-delay: 0.7s;
  }

  .loadstr > span:last-of-type {
    animation: letterFade 3s ease-in-out infinite;
    animation-delay: 0.9s;
  }

  @keyframes letterFade {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;
