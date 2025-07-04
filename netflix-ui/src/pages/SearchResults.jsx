import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Card from "../components/Card";
import styled from "styled-components";
import Navbar from "../components/Navbar";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery().get("q") || "";
  const movies = useSelector((state) => state.netflix.movies) || [];
  // Optionally, you could also search TV shows if you have them in state
  // const tvShows = useSelector((state) => state.netflix.tvShows) || [];

  const filtered = movies.filter(movie =>
    movie.name && movie.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Container>
      <Navbar />
      <div className="content">
        <h1>Search Results for "{query}"</h1>
        {filtered.length > 0 ? (
          <div className="grid flex">
            {filtered.map((movie, index) => (
              <Card movieData={movie} index={index} key={`${movie.id}-${index}`} />
            ))}
          </div>
        ) : (
          <h2 className="not-available">No results found.</h2>
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  .content {
    margin: 2.3rem;
    margin-top: 8rem;
    gap: 3rem;
    h1 {
      margin-left: 3rem;
    }
    .grid {
      flex-wrap: wrap;
      gap: 1rem;
    }
    .not-available {
      text-align: center;
      margin-top: 4rem;
    }
  }
`; 