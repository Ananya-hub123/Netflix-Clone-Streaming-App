import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import backgroundImage from "../assets/home.jpg";
import MovieLogo from "../assets/homeTitle.webp";

import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMovies, getGenres } from "../store";
import { FaPlay } from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import Slider from "../components/Slider";
import axios from "axios";

function Netflix() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [strangerThings, setStrangerThings] = useState(null);
  const [strangerThingsCast, setStrangerThingsCast] = useState([]);
  const movies = useSelector((state) => state.netflix.movies);
  const genres = useSelector((state) => state.netflix.genres);
  const genresLoaded = useSelector((state) => state.netflix.genresLoaded);

  useEffect(() => {
    async function fetchStrangerThings() {
      try {
        const { data } = await axios.get(
          `https://api.themoviedb.org/3/tv/66732?api_key=fe6060eaa48b9b5ffe0547efbb190fbe&language=en-US`
        );
        setStrangerThings(data);
        // Fetch cast
        const castRes = await axios.get(
          `https://api.themoviedb.org/3/tv/66732/credits?api_key=fe6060eaa48b9b5ffe0547efbb190fbe&language=en-US`
        );
        setStrangerThingsCast(castRes.data.cast.slice(0, 8)); // Show top 8 cast members
      } catch (err) {
        setStrangerThings(null);
        setStrangerThingsCast([]);
      }
    }
    fetchStrangerThings();
  }, []);

  // Use Stranger Things as the featured movie if available
  const featuredMovie = strangerThings || (movies && movies.length > 0 ? movies[0] : null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getGenres());
  }, []);

  useEffect(() => {
    if (genresLoaded) {
      dispatch(fetchMovies({ genres, type: "all" }));
    }
  }, [genresLoaded]);

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (!currentUser) navigate("/login");
  });

  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
    return () => (window.onscroll = null);
  };

  return (
    <Container>
      <Navbar isScrolled={isScrolled} />
      <div className="hero">
        <img
          src={backgroundImage}
          alt="background"
          className="background-image"
        />
        <div className="container">
          <div className="logo">
            <img src={MovieLogo} alt="Movie Logo" />
          </div>
          <div className="buttons flex">
            <button
              onClick={() => navigate("/player")}
              className="flex j-center a-center"
            >
              <FaPlay />
              Play
            </button>
            <button className="flex j-center a-center" onClick={() => setShowInfo(true)}>
              <AiOutlineInfoCircle />
              More Info
            </button>
          </div>
        </div>
      </div>
      <Slider movies={movies} />
      {showInfo && featuredMovie && (
        <ModalOverlay onClick={() => setShowInfo(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            {featuredMovie.id === 66732 ? (
              <>
                <h2>{featuredMovie.name || featuredMovie.original_name}</h2>
                <div className="meta">
                  {featuredMovie.first_air_date ? featuredMovie.first_air_date.substring(0, 4) : ""}
                  {featuredMovie.number_of_seasons ? <span>• {featuredMovie.number_of_seasons} Seasons</span> : null}
                  <span>• U/A 16+</span>
                </div>
                <div className="genres">
                  {featuredMovie.genres && featuredMovie.genres.map(g => (
                    <span className="genre-chip" key={g.id || g.name}>{g.name}</span>
                  ))}
                </div>
                <div className="divider" />
                <div className="description">
                  {featuredMovie.overview}
                </div>
                {strangerThingsCast.length > 0 && (
                  <>
                    <div className="divider" />
                    <div className="cast-label">Cast</div>
                    <div className="cast-list">
                      {strangerThingsCast.map((actor) => (
                        <span className="cast-member" key={actor.id}>{actor.name}</span>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <h2>{featuredMovie.name}</h2>
                <p><strong>Genres:</strong> {featuredMovie.genres && featuredMovie.genres.join(", ")}</p>
                {featuredMovie.description && <p><strong>Description:</strong> {featuredMovie.description}</p>}
                {featuredMovie.releaseDate && <p><strong>Release Date:</strong> {featuredMovie.releaseDate}</p>}
                {featuredMovie.rating && <p><strong>Rating:</strong> {featuredMovie.rating}</p>}
              </>
            )}
            <button onClick={() => setShowInfo(false)}>Close</button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

const Container = styled.div`
  background-color: black;
  .hero {
    position: relative;
    .background-image {
      filter: brightness(60%);
    }
    img {
      height: 100vh;
      width: 100vw;
    }
    .container {
      position: absolute;
      bottom: 5rem;
      .logo {
        img {
          width: 100%;
          height: 100%;
          margin-left: 5rem;
        }
      }
      .buttons {
        margin: 5rem;
        gap: 2rem;
        button {
          font-size: 1.4rem;
          gap: 1rem;
          border-radius: 0.2rem;
          padding: 0.5rem;
          padding-left: 2rem;
          padding-right: 2.4rem;
          border: none;
          cursor: pointer;
          transition: 0.2s ease-in-out;
          &:hover {
            opacity: 0.8;
          }
          &:nth-of-type(2) {
            background-color: rgba(109, 109, 110, 0.7);
            color: white;
            svg {
              font-size: 1.8rem;
            }
          }
        }
      }
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: #181818;
  color: #fff;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 18px;
  min-width: 320px;
  max-width: 95vw;
  max-height: 90vh;
  box-shadow: 0 4px 32px rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  overflow-y: auto;

  h2 {
    font-size: 2.4rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    letter-spacing: 1px;
  }
  .meta {
    font-size: 1.1rem;
    color: #b3b3b3;
    margin-bottom: 1.2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    align-items: center;
  }
  .genres {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.2rem;
  }
  .genre-chip {
    background: #282828;
    color: #fff;
    border-radius: 12px;
    padding: 0.2rem 0.9rem;
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    border: 1px solid #333;
  }
  .divider {
    width: 100%;
    height: 1px;
    background: #333;
    margin: 1.2rem 0 1.2rem 0;
    border-radius: 2px;
  }
  .description {
    font-size: 1.15rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    color: #e0e0e0;
  }
  .cast-label {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #fff;
  }
  .cast-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem 1.2rem;
    margin-bottom: 0.5rem;
  }
  .cast-member {
    background: #232323;
    color: #e0e0e0;
    border-radius: 8px;
    padding: 0.25rem 0.9rem;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.2px;
    border: 1px solid #333;
    margin-bottom: 0.2rem;
  }
  button {
    margin-top: 0.5rem;
    padding: 0.6rem 2.2rem;
    background: #e50914;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
    align-self: flex-end;
    transition: background 0.2s;
    box-shadow: 0 2px 8px rgba(229,9,20,0.12);
    &:hover {
      background: #b0060f;
    }
  }
  @media (max-width: 600px) {
    padding: 1.2rem 0.5rem 1rem 0.5rem;
    h2 { font-size: 1.5rem; }
    .description { font-size: 1rem; }
    button { font-size: 1rem; padding: 0.5rem 1.2rem; }
  }
`;

export default Netflix;