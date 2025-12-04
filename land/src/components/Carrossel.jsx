import React from 'react';
import styled from 'styled-components';

const CarouselSection = styled.section`
  margin-top: 40px;
`;
const CarouselTitle = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;
const CarouselWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
`;
const CarouselBtn = styled.button`
  background: var(--verde-medio);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  margin: 0 10px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: var(--verde-escuro);
  }
`;
const CarouselContainer = styled.div`
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 100%;
  overflow-x: auto;
  gap: 10px;
`;
const CarouselImg = styled.img`
  height: 120px;
  width: 180px;
  object-fit: cover;
  border-radius: 8px;
`;

const Carousel = () => {
  return (
    <CarouselSection>
      <CarouselTitle>Explore Mais Trilhas</CarouselTitle>
      <CarouselWrapper>
        <CarouselBtn className="carrossel-btn left">&#10094;</CarouselBtn>
        <CarouselContainer id="carrossel">
          <CarouselImg src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCO-9YoC0iQb0K1dtJAk-XU8j8a3gb_LBUpw&s" alt="Trilha 1" />
          <CarouselImg src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq641Faj9q1hjdAjzLAMCsJd9VOqHo12j3Gw&s" alt="Trilha 2" />
          <CarouselImg src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ46uTpc20WcN7AtMxWtGB48hkvdZTRDliLqg&s" alt="Trilha 3" />
          <CarouselImg src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe9Jm-aS4OJvBf1As7WfliU_y8_62t78dKuA&s" alt="Trilha 4" />
          <CarouselImg src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSXpvYW1nMwTJuN7DcGR9SF8yrbUOSLkSBaA&s" alt="Trilha 5" />
        </CarouselContainer>
        <CarouselBtn className="carrossel-btn right">&#10095;</CarouselBtn>
      </CarouselWrapper>
    </CarouselSection>
  );
};

export default Carousel;
