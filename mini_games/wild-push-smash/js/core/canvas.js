import { ARENA } from '../../data_model/match.js';

export const canvas = document.getElementById('gameCanvas');
canvas.width = ARENA.width;
canvas.height = ARENA.height;
export const ctx = canvas.getContext('2d');
export const W = canvas.width;
export const H = canvas.height;
