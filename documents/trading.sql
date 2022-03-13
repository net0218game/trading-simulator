-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2022. Már 13. 22:53
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
  `userID` int(16) NOT NULL,
  `currency` varchar(16) NOT NULL,
  `pair` varchar(16) NOT NULL,
  `currencyValue` float NOT NULL,
  `pairValue` float NOT NULL,
  `date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `coins`
--

INSERT INTO `coins` (`userID`, `currency`, `pair`, `currencyValue`, `pairValue`, `date`) VALUES
(1, 'btc', 'busd', 0.006, 290.963, '0000-00-00 00:00:00.000000'),
(5, 'btc', 'busd', 0.001, 39.0098, '0000-00-00 00:00:00.000000'),
(1, 'eth', 'busd', 0.033575, 1000.91, '0000-00-00 00:00:00.000000'),
(1, 'doge', 'busd', 2, 0.233, '0000-00-00 00:00:00.000000'),
(1, 'bnb', 'busd', 2.5, 926.75, '0000-00-00 00:00:00.000000'),
(1, 'shib', 'busd', 100, 0.002223, '0000-00-00 00:00:00.000000');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `ID` int(16) NOT NULL,
  `username` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(30) NOT NULL,
  `token` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`ID`, `username`, `email`, `password`, `token`) VALUES
(1, 'david', 'game.net0218@gmail.com', 'davidvagyok', 163.968),
(5, 'sziaendavidvagyo', 'alma@gmail.com', 'davidvagyok', 9960.99),
(6, 'david2', 'game.net0218@gmail.com', 'davidvagyok', 10000),
(7, 'sziaezafelhasznalonevem', 'a@gmail.com', 'davidvagyok', 10000);

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
  MODIFY `ID` int(16) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
