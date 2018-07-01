'use strict';

module.exports.GAME_WIDTH = 684;
module.exports.GAME_HEIGHT = 341;
module.exports.MAP_SIZE_WIDTH = 684;
module.exports.MAP_SIZE_HEIGHT = 341;
module.exports.BallSize = 5;
module.exports.BallMass = 1;
module.exports.Friction = -0.015;
module.exports.FrameRate = 4000;
module.exports.GoalWidth = 100;

module.exports.PlayerMass = 3.0;
module.exports.PlayerMaxForce = 1.0;
module.exports.PlayerMaxSpeedWithBall = 1.2;
module.exports.PlayerMaxSpeedWithoutBall = 1.6;
module.exports.PlayerMaxTurnRate = 0.4;
module.exports.PlayerScale = 1.0;

module.exports.ChancePlayerAttemptsPotShot = 0.005;
module.exports.ChanceOfUsingArriveTypeReceiveBehavior = 0.5;

module.exports.GoalKeeperTendingDistance = 20;
module.exports.NumAttemptsToFindValidStrike = 5;
module.exports.GoalKeeperInterceptRange = 100;
module.exports.GoalKeeperInterceptRangeSq = module.exports.GoalKeeperInterceptRange * module.exports.GoalKeeperInterceptRange;
module.exports.KeeperInBallRange = 10;
module.exports.KeeperInBallRangeSq = module.exports.KeeperInBallRange * module.exports.KeeperInBallRange;
module.exports.GoalkeeperMinPassDist = 50;
module.exports.PlayerKickingAccuracy = 0.99;
module.exports.BallWithinReceivingRange = 10;
module.exports.BallWithinReceivingRangeSq = module.exports.BallWithinReceivingRange * module.exports.BallWithinReceivingRange;
module.exports.PlayerKickingDistance = 6 + module.exports.BallSize;
module.exports.PlayerKickingDistanceSq = module.exports.PlayerKickingDistance * module.exports.PlayerKickingDistance;
module.exports.SeparationCoefficient = 10;
module.exports.ViewDistance = 30;
module.exports.PlayerComfortZone = 60;
module.exports.PlayerComfortZoneSq = module.exports.PlayerComfortZone * module.exports.PlayerComfortZone;
module.exports.PlayerInTargetRange = 10;
module.exports.PlayerInTargetRangeSq = module.exports.PlayerInTargetRange * module.exports.PlayerInTargetRange;

module.exports.NumSupportSpotsX = 13;
module.exports.NumSupportSpotsY = 6;
module.exports.SupportSpotUpdateFreq = 1;
module.exports.MaxShootingForce = 6;
module.exports.MaxDribbleForce = 1.5;
module.exports.MinPassDist = 120.0;
module.exports.MaxPassingForce = 3.0;
module.exports.Spot_PassSafeScore = 2;
module.exports.Spot_CanScoreFromPositionScore = 1;
module.exports.Spot_DistFromControllingPlayerScore = 2;
module.exports.PlayerKickFrequency = 8;
