K_FACTOR = 32


def expected_score(player_elo: int, opponent_elo: int) -> float:
    return 1 / (1 + 10 ** ((opponent_elo - player_elo) / 400))


def new_elo(player_elo: int, opponent_elo: int, result: float) -> int:
    """
    result: 1.0 = win, 0.5 = draw, 0.0 = loss
    Returns updated player ELO.
    """
    delta = round(K_FACTOR * (result - expected_score(player_elo, opponent_elo)))
    return player_elo + delta
