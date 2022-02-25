-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2022. Feb 25. 22:33
-- Kiszolgáló verziója: 10.4.22-MariaDB
-- PHP verzió: 8.0.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `trading`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `coins`
--

CREATE TABLE `coins` (
  `userID` int(100) NOT NULL,
  `currency` varchar(100) NOT NULL,
  `pair` varchar(100) NOT NULL,
  `currencyValue` int(100) NOT NULL,
  `pairValue` int(100) NOT NULL,
  `date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `coins`
--

INSERT INTO `coins` (`userID`, `currency`, `pair`, `currencyValue`, `pairValue`, `date`) VALUES
(0, 'btc', 'busd', 0, 7867, '0000-00-00 00:00:00.000000'),
(0, 'btc', 'busd', 0, 7882, '0000-00-00 00:00:00.000000'),
(0, 'btc', 'busd', 0, 3957, '0000-00-00 00:00:00.000000'),
(0, 'btc', 'busd', 0, 7900, '0000-00-00 00:00:00.000000'),
(0, 'btc', 'busd', 0, 40, '0000-00-00 00:00:00.000000'),
(0, 'btc', 'busd', 0, 1, '0000-00-00 00:00:00.000000');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `ID` int(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `token` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`ID`, `username`, `email`, `password`, `token`) VALUES
(1, 'david', '', 'davidvagyok', 2059),
(2, 'gyork', '', 'gyorkvagyok', 10000);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
