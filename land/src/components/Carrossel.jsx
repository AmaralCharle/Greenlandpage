import React from 'react';

const Carousel = () => {
  return (
    <section className="carrossel-imagens">
      <h2>Explore Mais Trilhas</h2>
      <div className="carrossel-wrapper">
        <button className="carrossel-btn left">&#10094;</button>
        <div className="carrossel-container" id="carrossel">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCO-9YoC0iQb0K1dtJAk-XU8j8a3gb_LBUpw&s" alt="Trilha 1" />
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq641Faj9q1hjdAjzLAMCsJd9VOqHo12j3Gw&s" alt="Trilha 2" />
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ46uTpc20WcN7AtMxWtGB48hkvdZTRDliLqg&s" alt="Trilha 3" />
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe9Jm-aS4OJvBf1As7WfliU_y8_62t78dKuA&s" alt="Trilha 4" />
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSXpvYW1nMwTJuN7DcGR9SF8yrbUOSLkSBaA&s" alt="Trilha 5" />
        </div>
        <button className="carrossel-btn right">&#10095;</button>
      </div>
    </section>
  );
};

export default Carousel;
