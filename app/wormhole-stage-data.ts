// 확정·검증된 웜홀 맵 데이터입니다. 브라우저에서는 맵을 다시 생성하거나 검증하지 않습니다.
export const WORMHOLE_STAGE_DATA = [
  {
    "id": 1,
    "name": "휘어진 첫걸음",
    "subtitle": "작은 원형 맵 · 기본 곡률 이동",
    "ringCount": 5,
    "blocks": [
      "0,2",
      "0,7",
      "1,5",
      "1,10",
      "2,0",
      "2,1",
      "2,5",
      "3,1",
      "3,8",
      "4,0",
      "4,4"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 5
      },
      {
        "ring": 1,
        "sector": 10
      },
      {
        "ring": 2,
        "sector": 0
      },
      {
        "ring": 2,
        "sector": 1
      },
      {
        "ring": 2,
        "sector": 5
      },
      {
        "ring": 3,
        "sector": 1
      },
      {
        "ring": 3,
        "sector": 8
      },
      {
        "ring": 4,
        "sector": 0
      },
      {
        "ring": 4,
        "sector": 4
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 2,
      "sector": 3
    },
    "goal": {
      "ring": 3,
      "sector": 7
    },
    "par": 3,
    "solution": [
      "cw",
      "out",
      "cw"
    ],
    "solutionFeatures": []
  },
  {
    "id": 2,
    "name": "안쪽 고리",
    "subtitle": "작은 원형 맵 · 기본 곡률 이동",
    "ringCount": 5,
    "blocks": [
      "0,9",
      "0,10",
      "1,7",
      "2,2",
      "2,3",
      "2,5",
      "2,6",
      "2,11",
      "3,0",
      "3,11",
      "4,2",
      "4,3",
      "4,7",
      "4,8"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 9
      },
      {
        "ring": 0,
        "sector": 10
      },
      {
        "ring": 1,
        "sector": 7
      },
      {
        "ring": 2,
        "sector": 2
      },
      {
        "ring": 2,
        "sector": 3
      },
      {
        "ring": 2,
        "sector": 5
      },
      {
        "ring": 2,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 3,
        "sector": 0
      },
      {
        "ring": 3,
        "sector": 11
      },
      {
        "ring": 4,
        "sector": 2
      },
      {
        "ring": 4,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 7
      },
      {
        "ring": 4,
        "sector": 8
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 4,
      "sector": 6
    },
    "goal": {
      "ring": 1,
      "sector": 9
    },
    "par": 4,
    "solution": [
      "in",
      "cw",
      "in",
      "ccw"
    ],
    "solutionFeatures": []
  },
  {
    "id": 3,
    "name": "반시계 산책",
    "subtitle": "작은 원형 맵 · 기본 곡률 이동",
    "ringCount": 5,
    "blocks": [
      "0,9",
      "1,4",
      "1,7",
      "1,8",
      "2,8",
      "3,1",
      "3,6",
      "4,0",
      "4,3"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 9
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 1,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 8
      },
      {
        "ring": 3,
        "sector": 1
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 0
      },
      {
        "ring": 4,
        "sector": 3
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 3,
      "sector": 7
    },
    "goal": {
      "ring": 1,
      "sector": 9
    },
    "par": 3,
    "solution": [
      "in",
      "ccw",
      "in"
    ],
    "solutionFeatures": []
  },
  {
    "id": 4,
    "name": "바깥 궤도",
    "subtitle": "작은 원형 맵 · 기본 곡률 이동",
    "ringCount": 5,
    "blocks": [
      "0,3",
      "0,9",
      "1,6",
      "2,4",
      "2,9",
      "3,2",
      "3,3",
      "3,4",
      "3,11",
      "4,0",
      "4,8",
      "4,10"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 3
      },
      {
        "ring": 0,
        "sector": 9
      },
      {
        "ring": 1,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 9
      },
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 3
      },
      {
        "ring": 3,
        "sector": 4
      },
      {
        "ring": 3,
        "sector": 11
      },
      {
        "ring": 4,
        "sector": 0
      },
      {
        "ring": 4,
        "sector": 8
      },
      {
        "ring": 4,
        "sector": 10
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 0,
      "sector": 2
    },
    "goal": {
      "ring": 0,
      "sector": 5
    },
    "par": 4,
    "solution": [
      "ccw",
      "out",
      "ccw",
      "in"
    ],
    "solutionFeatures": []
  },
  {
    "id": 5,
    "name": "곡률 연습",
    "subtitle": "작은 원형 맵 · 기본 곡률 이동",
    "ringCount": 5,
    "blocks": [
      "0,3",
      "0,6",
      "0,9",
      "0,11",
      "1,0",
      "1,1",
      "1,7",
      "1,11",
      "2,11",
      "3,7",
      "4,3",
      "4,5",
      "4,6"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 3
      },
      {
        "ring": 0,
        "sector": 6
      },
      {
        "ring": 0,
        "sector": 9
      },
      {
        "ring": 0,
        "sector": 11
      },
      {
        "ring": 1,
        "sector": 0
      },
      {
        "ring": 1,
        "sector": 1
      },
      {
        "ring": 1,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 11
      },
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 3,
        "sector": 7
      },
      {
        "ring": 4,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 5
      },
      {
        "ring": 4,
        "sector": 6
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 0,
      "sector": 4
    },
    "goal": {
      "ring": 1,
      "sector": 8
    },
    "par": 4,
    "solution": [
      "cw",
      "out",
      "ccw",
      "in"
    ],
    "solutionFeatures": []
  },
  {
    "id": 6,
    "name": "중력 우회",
    "subtitle": "작은 원형 맵 · 기본 곡률 이동",
    "ringCount": 5,
    "blocks": [
      "1,1",
      "1,2",
      "1,9",
      "2,1",
      "2,2",
      "2,6",
      "2,7",
      "3,2",
      "3,6",
      "3,10",
      "4,0",
      "4,5",
      "4,7"
    ],
    "blockCells": [
      {
        "ring": 1,
        "sector": 1
      },
      {
        "ring": 1,
        "sector": 2
      },
      {
        "ring": 1,
        "sector": 9
      },
      {
        "ring": 2,
        "sector": 1
      },
      {
        "ring": 2,
        "sector": 2
      },
      {
        "ring": 2,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 3,
        "sector": 10
      },
      {
        "ring": 4,
        "sector": 0
      },
      {
        "ring": 4,
        "sector": 5
      },
      {
        "ring": 4,
        "sector": 7
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 3,
      "sector": 7
    },
    "goal": {
      "ring": 3,
      "sector": 1
    },
    "par": 5,
    "solution": [
      "cw",
      "in",
      "cw",
      "out",
      "cw"
    ],
    "solutionFeatures": []
  },
  {
    "id": 7,
    "name": "원주 교차",
    "subtitle": "작은 원형 맵 · 기본 곡률 이동",
    "ringCount": 5,
    "blocks": [
      "0,8",
      "0,10",
      "1,10",
      "2,3",
      "2,11",
      "3,4",
      "3,9",
      "4,9",
      "4,10"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 8
      },
      {
        "ring": 0,
        "sector": 10
      },
      {
        "ring": 1,
        "sector": 10
      },
      {
        "ring": 2,
        "sector": 3
      },
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 3,
        "sector": 4
      },
      {
        "ring": 3,
        "sector": 9
      },
      {
        "ring": 4,
        "sector": 9
      },
      {
        "ring": 4,
        "sector": 10
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 0,
      "sector": 7
    },
    "goal": {
      "ring": 3,
      "sector": 1
    },
    "par": 7,
    "solution": [
      "ccw",
      "out",
      "cw",
      "out",
      "cw",
      "out",
      "cw"
    ],
    "solutionFeatures": []
  },
  {
    "id": 8,
    "name": "고리 건너기",
    "subtitle": "작은 원형 맵 · 기본 곡률 이동",
    "ringCount": 5,
    "blocks": [
      "0,1",
      "0,2",
      "0,5",
      "0,7",
      "0,9",
      "1,2",
      "1,4",
      "1,5",
      "1,10",
      "2,0",
      "2,3",
      "2,4",
      "2,5",
      "2,8",
      "3,2",
      "3,3",
      "3,6",
      "3,9",
      "4,0",
      "4,11"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 1
      },
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 0,
        "sector": 5
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 0,
        "sector": 9
      },
      {
        "ring": 1,
        "sector": 2
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 1,
        "sector": 5
      },
      {
        "ring": 1,
        "sector": 10
      },
      {
        "ring": 2,
        "sector": 0
      },
      {
        "ring": 2,
        "sector": 3
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 5
      },
      {
        "ring": 2,
        "sector": 8
      },
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 3
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 3,
        "sector": 9
      },
      {
        "ring": 4,
        "sector": 0
      },
      {
        "ring": 4,
        "sector": 11
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 0,
      "sector": 8
    },
    "goal": {
      "ring": 0,
      "sector": 11
    },
    "par": 5,
    "solution": [
      "out",
      "cw",
      "out",
      "cw",
      "in"
    ],
    "solutionFeatures": []
  },
  {
    "id": 9,
    "name": "자오선 입문",
    "subtitle": "작은 원형 맵 · 기본 곡률 이동",
    "ringCount": 5,
    "blocks": [
      "0,7",
      "1,1",
      "1,4",
      "2,5",
      "2,8",
      "2,10",
      "3,8",
      "3,10",
      "4,2",
      "4,3",
      "4,6",
      "4,11"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 1
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 5
      },
      {
        "ring": 2,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 10
      },
      {
        "ring": 3,
        "sector": 8
      },
      {
        "ring": 3,
        "sector": 10
      },
      {
        "ring": 4,
        "sector": 2
      },
      {
        "ring": 4,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 11
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 2,
      "sector": 2
    },
    "goal": {
      "ring": 0,
      "sector": 0
    },
    "par": 5,
    "solution": [
      "out",
      "cw",
      "in",
      "cw",
      "in"
    ],
    "solutionFeatures": []
  },
  {
    "id": 10,
    "name": "작은 에테르 핵",
    "subtitle": "작은 원형 맵 · 기본 곡률 이동",
    "ringCount": 5,
    "blocks": [
      "0,2",
      "0,5",
      "0,7",
      "0,8",
      "1,5",
      "1,8",
      "1,10",
      "2,3",
      "2,7",
      "2,8",
      "2,9",
      "3,7",
      "3,8",
      "3,11",
      "4,4",
      "4,6",
      "4,7"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 0,
        "sector": 5
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 0,
        "sector": 8
      },
      {
        "ring": 1,
        "sector": 5
      },
      {
        "ring": 1,
        "sector": 8
      },
      {
        "ring": 1,
        "sector": 10
      },
      {
        "ring": 2,
        "sector": 3
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 2,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 9
      },
      {
        "ring": 3,
        "sector": 7
      },
      {
        "ring": 3,
        "sector": 8
      },
      {
        "ring": 3,
        "sector": 11
      },
      {
        "ring": 4,
        "sector": 4
      },
      {
        "ring": 4,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 7
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 2,
      "sector": 10
    },
    "goal": {
      "ring": 0,
      "sector": 6
    },
    "par": 6,
    "solution": [
      "cw",
      "in",
      "cw",
      "out",
      "cw",
      "in"
    ],
    "solutionFeatures": []
  },
  {
    "id": 11,
    "name": "확장 궤도",
    "subtitle": "확장 원형 맵 · 긴 궤도",
    "ringCount": 7,
    "blocks": [
      "0,5",
      "0,6",
      "0,10",
      "0,11",
      "1,1",
      "1,7",
      "1,10",
      "2,6",
      "2,10",
      "3,3",
      "3,6",
      "3,7",
      "4,9",
      "5,0",
      "5,4",
      "5,6",
      "5,7",
      "6,2",
      "6,5",
      "6,10",
      "6,11"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 5
      },
      {
        "ring": 0,
        "sector": 6
      },
      {
        "ring": 0,
        "sector": 10
      },
      {
        "ring": 0,
        "sector": 11
      },
      {
        "ring": 1,
        "sector": 1
      },
      {
        "ring": 1,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 10
      },
      {
        "ring": 2,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 10
      },
      {
        "ring": 3,
        "sector": 3
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 3,
        "sector": 7
      },
      {
        "ring": 4,
        "sector": 9
      },
      {
        "ring": 5,
        "sector": 0
      },
      {
        "ring": 5,
        "sector": 4
      },
      {
        "ring": 5,
        "sector": 6
      },
      {
        "ring": 5,
        "sector": 7
      },
      {
        "ring": 6,
        "sector": 2
      },
      {
        "ring": 6,
        "sector": 5
      },
      {
        "ring": 6,
        "sector": 10
      },
      {
        "ring": 6,
        "sector": 11
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 3,
      "sector": 8
    },
    "goal": {
      "ring": 1,
      "sector": 0
    },
    "par": 7,
    "solution": [
      "cw",
      "out",
      "ccw",
      "in",
      "ccw",
      "in",
      "cw"
    ],
    "solutionFeatures": []
  },
  {
    "id": 12,
    "name": "긴 자오선",
    "subtitle": "확장 원형 맵 · 긴 궤도",
    "ringCount": 7,
    "blocks": [
      "0,1",
      "0,2",
      "0,7",
      "1,0",
      "1,3",
      "1,5",
      "1,6",
      "2,4",
      "2,11",
      "3,7",
      "4,4",
      "4,6",
      "5,1",
      "5,6",
      "6,0",
      "6,3"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 1
      },
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 0
      },
      {
        "ring": 1,
        "sector": 3
      },
      {
        "ring": 1,
        "sector": 5
      },
      {
        "ring": 1,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 3,
        "sector": 7
      },
      {
        "ring": 4,
        "sector": 4
      },
      {
        "ring": 4,
        "sector": 6
      },
      {
        "ring": 5,
        "sector": 1
      },
      {
        "ring": 5,
        "sector": 6
      },
      {
        "ring": 6,
        "sector": 0
      },
      {
        "ring": 6,
        "sector": 3
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 6,
      "sector": 9
    },
    "goal": {
      "ring": 5,
      "sector": 0
    },
    "par": 10,
    "solution": [
      "ccw",
      "in",
      "ccw",
      "in",
      "ccw",
      "out",
      "cw",
      "in",
      "ccw",
      "out"
    ],
    "solutionFeatures": []
  },
  {
    "id": 13,
    "name": "외곽 순환",
    "subtitle": "확장 원형 맵 · 긴 궤도",
    "ringCount": 7,
    "blocks": [
      "0,8",
      "0,10",
      "0,11",
      "1,2",
      "1,3",
      "1,6",
      "1,7",
      "2,0",
      "2,1",
      "2,4",
      "3,7",
      "3,9",
      "4,1",
      "4,2",
      "4,7",
      "5,10",
      "6,8",
      "6,10"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 8
      },
      {
        "ring": 0,
        "sector": 10
      },
      {
        "ring": 0,
        "sector": 11
      },
      {
        "ring": 1,
        "sector": 2
      },
      {
        "ring": 1,
        "sector": 3
      },
      {
        "ring": 1,
        "sector": 6
      },
      {
        "ring": 1,
        "sector": 7
      },
      {
        "ring": 2,
        "sector": 0
      },
      {
        "ring": 2,
        "sector": 1
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 3,
        "sector": 7
      },
      {
        "ring": 3,
        "sector": 9
      },
      {
        "ring": 4,
        "sector": 1
      },
      {
        "ring": 4,
        "sector": 2
      },
      {
        "ring": 4,
        "sector": 7
      },
      {
        "ring": 5,
        "sector": 10
      },
      {
        "ring": 6,
        "sector": 8
      },
      {
        "ring": 6,
        "sector": 10
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 0,
      "sector": 7
    },
    "goal": {
      "ring": 3,
      "sector": 5
    },
    "par": 9,
    "solution": [
      "ccw",
      "out",
      "ccw",
      "out",
      "cw",
      "in",
      "cw",
      "in",
      "cw"
    ],
    "solutionFeatures": []
  },
  {
    "id": 14,
    "name": "중력 미로",
    "subtitle": "확장 원형 맵 · 긴 궤도",
    "ringCount": 7,
    "blocks": [
      "0,2",
      "0,11",
      "1,1",
      "1,4",
      "1,8",
      "2,2",
      "2,10",
      "3,0",
      "3,2",
      "3,5",
      "3,8",
      "4,1",
      "4,11",
      "5,5",
      "5,6",
      "5,7",
      "5,9",
      "5,10",
      "6,9"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 0,
        "sector": 11
      },
      {
        "ring": 1,
        "sector": 1
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 1,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 2
      },
      {
        "ring": 2,
        "sector": 10
      },
      {
        "ring": 3,
        "sector": 0
      },
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 5
      },
      {
        "ring": 3,
        "sector": 8
      },
      {
        "ring": 4,
        "sector": 1
      },
      {
        "ring": 4,
        "sector": 11
      },
      {
        "ring": 5,
        "sector": 5
      },
      {
        "ring": 5,
        "sector": 6
      },
      {
        "ring": 5,
        "sector": 7
      },
      {
        "ring": 5,
        "sector": 9
      },
      {
        "ring": 5,
        "sector": 10
      },
      {
        "ring": 6,
        "sector": 9
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 6,
      "sector": 1
    },
    "goal": {
      "ring": 3,
      "sector": 1
    },
    "par": 10,
    "solution": [
      "cw",
      "in",
      "cw",
      "in",
      "cw",
      "in",
      "cw",
      "out",
      "cw",
      "out"
    ],
    "solutionFeatures": []
  },
  {
    "id": 15,
    "name": "일곱 번째 고리",
    "subtitle": "확장 원형 맵 · 긴 궤도",
    "ringCount": 7,
    "blocks": [
      "0,3",
      "0,5",
      "0,7",
      "0,8",
      "0,10",
      "1,4",
      "1,5",
      "1,7",
      "1,8",
      "1,11",
      "2,3",
      "2,4",
      "2,7",
      "2,8",
      "2,9",
      "3,0",
      "3,1",
      "3,4",
      "3,10",
      "4,2",
      "4,11",
      "5,2",
      "5,3",
      "5,7",
      "6,5",
      "6,10"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 3
      },
      {
        "ring": 0,
        "sector": 5
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 0,
        "sector": 8
      },
      {
        "ring": 0,
        "sector": 10
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 1,
        "sector": 5
      },
      {
        "ring": 1,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 8
      },
      {
        "ring": 1,
        "sector": 11
      },
      {
        "ring": 2,
        "sector": 3
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 2,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 9
      },
      {
        "ring": 3,
        "sector": 0
      },
      {
        "ring": 3,
        "sector": 1
      },
      {
        "ring": 3,
        "sector": 4
      },
      {
        "ring": 3,
        "sector": 10
      },
      {
        "ring": 4,
        "sector": 2
      },
      {
        "ring": 4,
        "sector": 11
      },
      {
        "ring": 5,
        "sector": 2
      },
      {
        "ring": 5,
        "sector": 3
      },
      {
        "ring": 5,
        "sector": 7
      },
      {
        "ring": 6,
        "sector": 5
      },
      {
        "ring": 6,
        "sector": 10
      }
    ],
    "portals": [],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 0,
      "sector": 11
    },
    "goal": {
      "ring": 1,
      "sector": 6
    },
    "par": 12,
    "solution": [
      "cw",
      "out",
      "cw",
      "out",
      "cw",
      "out",
      "ccw",
      "in",
      "ccw",
      "out",
      "cw",
      "in"
    ],
    "solutionFeatures": []
  },
  {
    "id": 16,
    "name": "쌍둥이 문",
    "subtitle": "확장 원형 맵 · 순간이동 포탈",
    "ringCount": 7,
    "blocks": [
      "0,0",
      "0,1",
      "0,6",
      "1,6",
      "1,9",
      "2,1",
      "2,4",
      "2,8",
      "3,2",
      "3,5",
      "3,10",
      "4,3",
      "4,4",
      "4,7",
      "4,10",
      "5,3",
      "5,5",
      "5,8",
      "5,9",
      "6,5"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 0
      },
      {
        "ring": 0,
        "sector": 1
      },
      {
        "ring": 0,
        "sector": 6
      },
      {
        "ring": 1,
        "sector": 6
      },
      {
        "ring": 1,
        "sector": 9
      },
      {
        "ring": 2,
        "sector": 1
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 8
      },
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 5
      },
      {
        "ring": 3,
        "sector": 10
      },
      {
        "ring": 4,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 4
      },
      {
        "ring": 4,
        "sector": 7
      },
      {
        "ring": 4,
        "sector": 10
      },
      {
        "ring": 5,
        "sector": 3
      },
      {
        "ring": 5,
        "sector": 5
      },
      {
        "ring": 5,
        "sector": 8
      },
      {
        "ring": 5,
        "sector": 9
      },
      {
        "ring": 6,
        "sector": 5
      }
    ],
    "portals": [
      {
        "ring": 0,
        "sector": 5
      },
      {
        "ring": 2,
        "sector": 10
      }
    ],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 1,
      "sector": 11
    },
    "goal": {
      "ring": 2,
      "sector": 3
    },
    "par": 10,
    "solution": [
      "ccw",
      "out",
      "cw",
      "out",
      "cw",
      "in",
      "cw",
      "ccw",
      "out",
      "cw"
    ],
    "solutionFeatures": [
      "portal"
    ]
  },
  {
    "id": 17,
    "name": "공간 도약",
    "subtitle": "확장 원형 맵 · 순간이동 포탈",
    "ringCount": 7,
    "blocks": [
      "0,2",
      "0,3",
      "0,4",
      "0,9",
      "1,2",
      "1,5",
      "1,9",
      "2,7",
      "2,10",
      "3,1",
      "3,3",
      "3,8",
      "3,9",
      "3,10",
      "4,5",
      "4,7",
      "4,9",
      "4,11",
      "5,4",
      "5,10",
      "5,11",
      "6,0",
      "6,1",
      "6,6",
      "6,7",
      "6,8",
      "6,11"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 0,
        "sector": 3
      },
      {
        "ring": 0,
        "sector": 4
      },
      {
        "ring": 0,
        "sector": 9
      },
      {
        "ring": 1,
        "sector": 2
      },
      {
        "ring": 1,
        "sector": 5
      },
      {
        "ring": 1,
        "sector": 9
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 2,
        "sector": 10
      },
      {
        "ring": 3,
        "sector": 1
      },
      {
        "ring": 3,
        "sector": 3
      },
      {
        "ring": 3,
        "sector": 8
      },
      {
        "ring": 3,
        "sector": 9
      },
      {
        "ring": 3,
        "sector": 10
      },
      {
        "ring": 4,
        "sector": 5
      },
      {
        "ring": 4,
        "sector": 7
      },
      {
        "ring": 4,
        "sector": 9
      },
      {
        "ring": 4,
        "sector": 11
      },
      {
        "ring": 5,
        "sector": 4
      },
      {
        "ring": 5,
        "sector": 10
      },
      {
        "ring": 5,
        "sector": 11
      },
      {
        "ring": 6,
        "sector": 0
      },
      {
        "ring": 6,
        "sector": 1
      },
      {
        "ring": 6,
        "sector": 6
      },
      {
        "ring": 6,
        "sector": 7
      },
      {
        "ring": 6,
        "sector": 8
      },
      {
        "ring": 6,
        "sector": 11
      }
    ],
    "portals": [
      {
        "ring": 5,
        "sector": 9
      },
      {
        "ring": 2,
        "sector": 5
      }
    ],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 3,
      "sector": 0
    },
    "goal": {
      "ring": 5,
      "sector": 5
    },
    "par": 9,
    "solution": [
      "out",
      "cw",
      "in",
      "cw",
      "in",
      "ccw",
      "out",
      "cw",
      "ccw"
    ],
    "solutionFeatures": [
      "portal"
    ]
  },
  {
    "id": 18,
    "name": "접힌 자오선",
    "subtitle": "확장 원형 맵 · 순간이동 포탈",
    "ringCount": 7,
    "blocks": [
      "0,0",
      "0,1",
      "0,3",
      "0,4",
      "0,6",
      "1,11",
      "2,3",
      "3,0",
      "3,1",
      "3,5",
      "3,6",
      "4,0",
      "4,2",
      "4,10",
      "5,0",
      "5,1",
      "5,8",
      "5,9",
      "5,10",
      "5,11"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 0
      },
      {
        "ring": 0,
        "sector": 1
      },
      {
        "ring": 0,
        "sector": 3
      },
      {
        "ring": 0,
        "sector": 4
      },
      {
        "ring": 0,
        "sector": 6
      },
      {
        "ring": 1,
        "sector": 11
      },
      {
        "ring": 2,
        "sector": 3
      },
      {
        "ring": 3,
        "sector": 0
      },
      {
        "ring": 3,
        "sector": 1
      },
      {
        "ring": 3,
        "sector": 5
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 0
      },
      {
        "ring": 4,
        "sector": 2
      },
      {
        "ring": 4,
        "sector": 10
      },
      {
        "ring": 5,
        "sector": 0
      },
      {
        "ring": 5,
        "sector": 1
      },
      {
        "ring": 5,
        "sector": 8
      },
      {
        "ring": 5,
        "sector": 9
      },
      {
        "ring": 5,
        "sector": 10
      },
      {
        "ring": 5,
        "sector": 11
      }
    ],
    "portals": [
      {
        "ring": 1,
        "sector": 8
      },
      {
        "ring": 5,
        "sector": 7
      }
    ],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 0,
      "sector": 2
    },
    "goal": {
      "ring": 6,
      "sector": 3
    },
    "par": 11,
    "solution": [
      "out",
      "cw",
      "in",
      "cw",
      "ccw",
      "cw",
      "out",
      "ccw",
      "out",
      "ccw",
      "out"
    ],
    "solutionFeatures": [
      "portal"
    ]
  },
  {
    "id": 19,
    "name": "순간 궤도",
    "subtitle": "확장 원형 맵 · 순간이동 포탈",
    "ringCount": 7,
    "blocks": [
      "0,2",
      "0,3",
      "0,4",
      "0,7",
      "0,8",
      "1,10",
      "1,11",
      "2,4",
      "2,6",
      "2,7",
      "2,9",
      "2,11",
      "3,0",
      "3,7",
      "4,1",
      "4,3",
      "4,8",
      "5,3",
      "5,6",
      "5,7",
      "5,8",
      "5,9",
      "6,2",
      "6,4",
      "6,5",
      "6,9",
      "6,11"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 0,
        "sector": 3
      },
      {
        "ring": 0,
        "sector": 4
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 0,
        "sector": 8
      },
      {
        "ring": 1,
        "sector": 10
      },
      {
        "ring": 1,
        "sector": 11
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 2,
        "sector": 9
      },
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 3,
        "sector": 0
      },
      {
        "ring": 3,
        "sector": 7
      },
      {
        "ring": 4,
        "sector": 1
      },
      {
        "ring": 4,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 8
      },
      {
        "ring": 5,
        "sector": 3
      },
      {
        "ring": 5,
        "sector": 6
      },
      {
        "ring": 5,
        "sector": 7
      },
      {
        "ring": 5,
        "sector": 8
      },
      {
        "ring": 5,
        "sector": 9
      },
      {
        "ring": 6,
        "sector": 2
      },
      {
        "ring": 6,
        "sector": 4
      },
      {
        "ring": 6,
        "sector": 5
      },
      {
        "ring": 6,
        "sector": 9
      },
      {
        "ring": 6,
        "sector": 11
      }
    ],
    "portals": [
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 6,
        "sector": 0
      }
    ],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 5,
      "sector": 1
    },
    "goal": {
      "ring": 3,
      "sector": 6
    },
    "par": 11,
    "solution": [
      "cw",
      "in",
      "ccw",
      "in",
      "ccw",
      "in",
      "ccw",
      "out",
      "cw",
      "out",
      "cw"
    ],
    "solutionFeatures": [
      "portal"
    ]
  },
  {
    "id": 20,
    "name": "웜홀 릴레이",
    "subtitle": "확장 원형 맵 · 순간이동 포탈",
    "ringCount": 7,
    "blocks": [
      "0,6",
      "0,7",
      "0,10",
      "1,3",
      "1,5",
      "1,11",
      "2,1",
      "2,4",
      "2,6",
      "2,7",
      "3,5",
      "3,6",
      "4,2",
      "4,9",
      "4,10",
      "5,0",
      "5,2",
      "6,1",
      "6,2",
      "6,4",
      "6,9"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 6
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 0,
        "sector": 10
      },
      {
        "ring": 1,
        "sector": 3
      },
      {
        "ring": 1,
        "sector": 5
      },
      {
        "ring": 1,
        "sector": 11
      },
      {
        "ring": 2,
        "sector": 1
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 3,
        "sector": 5
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 2
      },
      {
        "ring": 4,
        "sector": 9
      },
      {
        "ring": 4,
        "sector": 10
      },
      {
        "ring": 5,
        "sector": 0
      },
      {
        "ring": 5,
        "sector": 2
      },
      {
        "ring": 6,
        "sector": 1
      },
      {
        "ring": 6,
        "sector": 2
      },
      {
        "ring": 6,
        "sector": 4
      },
      {
        "ring": 6,
        "sector": 9
      }
    ],
    "portals": [
      {
        "ring": 1,
        "sector": 10
      },
      {
        "ring": 2,
        "sector": 11
      }
    ],
    "switches": [],
    "switchCells": [],
    "toggleBlocks": [],
    "toggleBlockCells": [],
    "start": {
      "ring": 6,
      "sector": 8
    },
    "goal": {
      "ring": 1,
      "sector": 0
    },
    "par": 13,
    "solution": [
      "ccw",
      "in",
      "ccw",
      "in",
      "ccw",
      "out",
      "cw",
      "out",
      "cw",
      "in",
      "ccw",
      "cw",
      "in"
    ],
    "solutionFeatures": [
      "portal"
    ]
  },
  {
    "id": 21,
    "name": "점멸 블록",
    "subtitle": "고난도 · 포탈과 블록 온오프",
    "ringCount": 7,
    "blocks": [
      "0,0",
      "0,1",
      "0,2",
      "0,3",
      "0,6",
      "0,7",
      "1,9",
      "2,4",
      "2,9",
      "2,11",
      "3,1",
      "3,2",
      "3,5",
      "3,8",
      "3,9",
      "4,0",
      "4,1",
      "4,5",
      "5,7",
      "6,3",
      "6,6",
      "6,7"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 0
      },
      {
        "ring": 0,
        "sector": 1
      },
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 0,
        "sector": 3
      },
      {
        "ring": 0,
        "sector": 6
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 9
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 9
      },
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 3,
        "sector": 1
      },
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 5
      },
      {
        "ring": 3,
        "sector": 8
      },
      {
        "ring": 3,
        "sector": 9
      },
      {
        "ring": 4,
        "sector": 0
      },
      {
        "ring": 4,
        "sector": 1
      },
      {
        "ring": 4,
        "sector": 5
      },
      {
        "ring": 5,
        "sector": 7
      },
      {
        "ring": 6,
        "sector": 3
      },
      {
        "ring": 6,
        "sector": 6
      },
      {
        "ring": 6,
        "sector": 7
      }
    ],
    "portals": [
      {
        "ring": 5,
        "sector": 11
      },
      {
        "ring": 6,
        "sector": 4
      }
    ],
    "switches": [
      "5,0"
    ],
    "switchCells": [
      {
        "ring": 5,
        "sector": 0
      }
    ],
    "toggleBlocks": [
      "1,6",
      "2,3",
      "4,11",
      "4,8",
      "2,7"
    ],
    "toggleBlockCells": [
      {
        "ring": 1,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 11
      },
      {
        "ring": 4,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 7
      }
    ],
    "start": {
      "ring": 4,
      "sector": 4
    },
    "goal": {
      "ring": 2,
      "sector": 0
    },
    "par": 12,
    "solution": [
      "in",
      "ccw",
      "out",
      "ccw",
      "ccw",
      "cw",
      "ccw",
      "in",
      "cw",
      "in",
      "cw",
      "in"
    ],
    "solutionFeatures": [
      "toggle",
      "portal"
    ]
  },
  {
    "id": 22,
    "name": "스위치 궤도",
    "subtitle": "고난도 · 포탈과 블록 온오프",
    "ringCount": 7,
    "blocks": [
      "0,2",
      "0,5",
      "1,4",
      "1,8",
      "1,11",
      "2,3",
      "2,4",
      "2,9",
      "3,1",
      "3,4",
      "3,6",
      "3,9",
      "4,2",
      "4,3",
      "5,9",
      "5,10",
      "6,3",
      "6,6",
      "6,7"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 0,
        "sector": 5
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 1,
        "sector": 8
      },
      {
        "ring": 1,
        "sector": 11
      },
      {
        "ring": 2,
        "sector": 3
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 9
      },
      {
        "ring": 3,
        "sector": 1
      },
      {
        "ring": 3,
        "sector": 4
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 3,
        "sector": 9
      },
      {
        "ring": 4,
        "sector": 2
      },
      {
        "ring": 4,
        "sector": 3
      },
      {
        "ring": 5,
        "sector": 9
      },
      {
        "ring": 5,
        "sector": 10
      },
      {
        "ring": 6,
        "sector": 3
      },
      {
        "ring": 6,
        "sector": 6
      },
      {
        "ring": 6,
        "sector": 7
      }
    ],
    "portals": [
      {
        "ring": 0,
        "sector": 10
      },
      {
        "ring": 4,
        "sector": 6
      }
    ],
    "switches": [
      "4,1"
    ],
    "switchCells": [
      {
        "ring": 4,
        "sector": 1
      }
    ],
    "toggleBlocks": [
      "2,5",
      "5,4",
      "5,11",
      "2,6",
      "3,8",
      "2,7",
      "5,3"
    ],
    "toggleBlockCells": [
      {
        "ring": 2,
        "sector": 5
      },
      {
        "ring": 5,
        "sector": 4
      },
      {
        "ring": 5,
        "sector": 11
      },
      {
        "ring": 2,
        "sector": 6
      },
      {
        "ring": 3,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 5,
        "sector": 3
      }
    ],
    "start": {
      "ring": 0,
      "sector": 6
    },
    "goal": {
      "ring": 1,
      "sector": 3
    },
    "par": 12,
    "solution": [
      "cw",
      "ccw",
      "out",
      "ccw",
      "in",
      "cw",
      "out",
      "ccw",
      "in",
      "cw",
      "in",
      "cw"
    ],
    "solutionFeatures": [
      "portal",
      "toggle"
    ]
  },
  {
    "id": 23,
    "name": "교차 차단선",
    "subtitle": "고난도 · 포탈과 블록 온오프",
    "ringCount": 7,
    "blocks": [
      "0,11",
      "1,4",
      "1,8",
      "2,2",
      "2,9",
      "2,11",
      "3,1",
      "3,3",
      "4,1",
      "4,3",
      "4,5",
      "4,9",
      "5,0",
      "5,5",
      "5,6",
      "5,7",
      "5,9",
      "6,1",
      "6,4",
      "6,5",
      "6,9",
      "6,10"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 11
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 1,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 2
      },
      {
        "ring": 2,
        "sector": 9
      },
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 3,
        "sector": 1
      },
      {
        "ring": 3,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 1
      },
      {
        "ring": 4,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 5
      },
      {
        "ring": 4,
        "sector": 9
      },
      {
        "ring": 5,
        "sector": 0
      },
      {
        "ring": 5,
        "sector": 5
      },
      {
        "ring": 5,
        "sector": 6
      },
      {
        "ring": 5,
        "sector": 7
      },
      {
        "ring": 5,
        "sector": 9
      },
      {
        "ring": 6,
        "sector": 1
      },
      {
        "ring": 6,
        "sector": 4
      },
      {
        "ring": 6,
        "sector": 5
      },
      {
        "ring": 6,
        "sector": 9
      },
      {
        "ring": 6,
        "sector": 10
      }
    ],
    "portals": [
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 9
      }
    ],
    "switches": [
      "2,5"
    ],
    "switchCells": [
      {
        "ring": 2,
        "sector": 5
      }
    ],
    "toggleBlocks": [
      "0,2",
      "2,8",
      "6,2",
      "6,3",
      "1,10",
      "0,4",
      "5,4"
    ],
    "toggleBlockCells": [
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 2,
        "sector": 8
      },
      {
        "ring": 6,
        "sector": 2
      },
      {
        "ring": 6,
        "sector": 3
      },
      {
        "ring": 1,
        "sector": 10
      },
      {
        "ring": 0,
        "sector": 4
      },
      {
        "ring": 5,
        "sector": 4
      }
    ],
    "start": {
      "ring": 5,
      "sector": 10
    },
    "goal": {
      "ring": 0,
      "sector": 6
    },
    "par": 14,
    "solution": [
      "cw",
      "in",
      "ccw",
      "out",
      "in",
      "ccw",
      "in",
      "cw",
      "out",
      "in",
      "cw",
      "out",
      "ccw",
      "in"
    ],
    "solutionFeatures": [
      "portal",
      "toggle"
    ]
  },
  {
    "id": 24,
    "name": "두 번의 도약",
    "subtitle": "고난도 · 포탈과 블록 온오프",
    "ringCount": 7,
    "blocks": [
      "0,4",
      "0,8",
      "0,10",
      "1,0",
      "1,1",
      "1,3",
      "1,4",
      "1,6",
      "2,3",
      "2,4",
      "2,5",
      "2,8",
      "2,9",
      "2,10",
      "3,1",
      "3,9",
      "3,10",
      "4,1",
      "4,11",
      "5,0",
      "5,7",
      "5,9",
      "6,0",
      "6,1"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 4
      },
      {
        "ring": 0,
        "sector": 8
      },
      {
        "ring": 0,
        "sector": 10
      },
      {
        "ring": 1,
        "sector": 0
      },
      {
        "ring": 1,
        "sector": 1
      },
      {
        "ring": 1,
        "sector": 3
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 1,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 3
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 5
      },
      {
        "ring": 2,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 9
      },
      {
        "ring": 2,
        "sector": 10
      },
      {
        "ring": 3,
        "sector": 1
      },
      {
        "ring": 3,
        "sector": 9
      },
      {
        "ring": 3,
        "sector": 10
      },
      {
        "ring": 4,
        "sector": 1
      },
      {
        "ring": 4,
        "sector": 11
      },
      {
        "ring": 5,
        "sector": 0
      },
      {
        "ring": 5,
        "sector": 7
      },
      {
        "ring": 5,
        "sector": 9
      },
      {
        "ring": 6,
        "sector": 0
      },
      {
        "ring": 6,
        "sector": 1
      }
    ],
    "portals": [
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 7
      }
    ],
    "switches": [
      "4,7"
    ],
    "switchCells": [
      {
        "ring": 4,
        "sector": 7
      }
    ],
    "toggleBlocks": [
      "0,9",
      "2,6",
      "4,4",
      "5,11",
      "1,5",
      "2,7",
      "6,5"
    ],
    "toggleBlockCells": [
      {
        "ring": 0,
        "sector": 9
      },
      {
        "ring": 2,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 4
      },
      {
        "ring": 5,
        "sector": 11
      },
      {
        "ring": 1,
        "sector": 5
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 6,
        "sector": 5
      }
    ],
    "start": {
      "ring": 0,
      "sector": 7
    },
    "goal": {
      "ring": 6,
      "sector": 6
    },
    "par": 13,
    "solution": [
      "out",
      "cw",
      "out",
      "cw",
      "in",
      "cw",
      "out",
      "ccw",
      "cw",
      "ccw",
      "out",
      "cw",
      "out"
    ],
    "solutionFeatures": [
      "portal",
      "toggle"
    ]
  },
  {
    "id": 25,
    "name": "곡률 잠금",
    "subtitle": "고난도 · 포탈과 블록 온오프",
    "ringCount": 7,
    "blocks": [
      "0,1",
      "0,7",
      "1,4",
      "1,6",
      "1,10",
      "2,2",
      "2,3",
      "2,4",
      "2,6",
      "2,7",
      "3,6",
      "4,4",
      "5,0",
      "5,5",
      "5,7",
      "6,3",
      "6,6",
      "6,7",
      "6,8",
      "6,9",
      "6,10",
      "6,11"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 1
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 1,
        "sector": 6
      },
      {
        "ring": 1,
        "sector": 10
      },
      {
        "ring": 2,
        "sector": 2
      },
      {
        "ring": 2,
        "sector": 3
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 4
      },
      {
        "ring": 5,
        "sector": 0
      },
      {
        "ring": 5,
        "sector": 5
      },
      {
        "ring": 5,
        "sector": 7
      },
      {
        "ring": 6,
        "sector": 3
      },
      {
        "ring": 6,
        "sector": 6
      },
      {
        "ring": 6,
        "sector": 7
      },
      {
        "ring": 6,
        "sector": 8
      },
      {
        "ring": 6,
        "sector": 9
      },
      {
        "ring": 6,
        "sector": 10
      },
      {
        "ring": 6,
        "sector": 11
      }
    ],
    "portals": [
      {
        "ring": 0,
        "sector": 6
      },
      {
        "ring": 5,
        "sector": 9
      }
    ],
    "switches": [
      "3,0"
    ],
    "switchCells": [
      {
        "ring": 3,
        "sector": 0
      }
    ],
    "toggleBlocks": [
      "4,8",
      "2,11",
      "2,9",
      "3,10",
      "0,4",
      "5,1"
    ],
    "toggleBlockCells": [
      {
        "ring": 4,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 2,
        "sector": 9
      },
      {
        "ring": 3,
        "sector": 10
      },
      {
        "ring": 0,
        "sector": 4
      },
      {
        "ring": 5,
        "sector": 1
      }
    ],
    "start": {
      "ring": 5,
      "sector": 6
    },
    "goal": {
      "ring": 1,
      "sector": 3
    },
    "par": 15,
    "solution": [
      "in",
      "cw",
      "in",
      "cw",
      "out",
      "ccw",
      "cw",
      "in",
      "cw",
      "out",
      "cw",
      "out",
      "ccw",
      "in",
      "cw"
    ],
    "solutionFeatures": [
      "portal",
      "toggle"
    ]
  },
  {
    "id": 26,
    "name": "에테르 회로",
    "subtitle": "고난도 · 포탈과 블록 온오프",
    "ringCount": 7,
    "blocks": [
      "0,5",
      "0,8",
      "0,10",
      "0,11",
      "1,2",
      "1,3",
      "1,9",
      "1,11",
      "2,1",
      "2,4",
      "2,7",
      "3,1",
      "3,2",
      "3,3",
      "3,6",
      "3,7",
      "3,8",
      "3,10",
      "4,3",
      "4,5",
      "5,3",
      "5,7",
      "5,8",
      "5,11",
      "6,4",
      "6,9"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 5
      },
      {
        "ring": 0,
        "sector": 8
      },
      {
        "ring": 0,
        "sector": 10
      },
      {
        "ring": 0,
        "sector": 11
      },
      {
        "ring": 1,
        "sector": 2
      },
      {
        "ring": 1,
        "sector": 3
      },
      {
        "ring": 1,
        "sector": 9
      },
      {
        "ring": 1,
        "sector": 11
      },
      {
        "ring": 2,
        "sector": 1
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 3,
        "sector": 1
      },
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 3
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 3,
        "sector": 7
      },
      {
        "ring": 3,
        "sector": 8
      },
      {
        "ring": 3,
        "sector": 10
      },
      {
        "ring": 4,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 5
      },
      {
        "ring": 5,
        "sector": 3
      },
      {
        "ring": 5,
        "sector": 7
      },
      {
        "ring": 5,
        "sector": 8
      },
      {
        "ring": 5,
        "sector": 11
      },
      {
        "ring": 6,
        "sector": 4
      },
      {
        "ring": 6,
        "sector": 9
      }
    ],
    "portals": [
      {
        "ring": 6,
        "sector": 3
      },
      {
        "ring": 0,
        "sector": 6
      }
    ],
    "switches": [
      "6,2"
    ],
    "switchCells": [
      {
        "ring": 6,
        "sector": 2
      }
    ],
    "toggleBlocks": [
      "2,11",
      "0,3",
      "5,6",
      "2,10",
      "1,5",
      "0,2"
    ],
    "toggleBlockCells": [
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 0,
        "sector": 3
      },
      {
        "ring": 5,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 10
      },
      {
        "ring": 1,
        "sector": 5
      },
      {
        "ring": 0,
        "sector": 2
      }
    ],
    "start": {
      "ring": 4,
      "sector": 7
    },
    "goal": {
      "ring": 6,
      "sector": 5
    },
    "par": 14,
    "solution": [
      "cw",
      "out",
      "in",
      "out",
      "cw",
      "out",
      "ccw",
      "out",
      "ccw",
      "out",
      "ccw",
      "out",
      "cw",
      "out"
    ],
    "solutionFeatures": [
      "toggle",
      "portal"
    ]
  },
  {
    "id": 27,
    "name": "차원 교차",
    "subtitle": "고난도 · 포탈과 블록 온오프",
    "ringCount": 7,
    "blocks": [
      "0,0",
      "0,1",
      "0,3",
      "0,4",
      "0,10",
      "1,3",
      "2,4",
      "2,5",
      "3,3",
      "3,8",
      "3,9",
      "4,2",
      "4,3",
      "4,5",
      "5,5",
      "5,10",
      "5,11",
      "6,1",
      "6,4",
      "6,7",
      "6,9",
      "6,11"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 0
      },
      {
        "ring": 0,
        "sector": 1
      },
      {
        "ring": 0,
        "sector": 3
      },
      {
        "ring": 0,
        "sector": 4
      },
      {
        "ring": 0,
        "sector": 10
      },
      {
        "ring": 1,
        "sector": 3
      },
      {
        "ring": 2,
        "sector": 4
      },
      {
        "ring": 2,
        "sector": 5
      },
      {
        "ring": 3,
        "sector": 3
      },
      {
        "ring": 3,
        "sector": 8
      },
      {
        "ring": 3,
        "sector": 9
      },
      {
        "ring": 4,
        "sector": 2
      },
      {
        "ring": 4,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 5
      },
      {
        "ring": 5,
        "sector": 5
      },
      {
        "ring": 5,
        "sector": 10
      },
      {
        "ring": 5,
        "sector": 11
      },
      {
        "ring": 6,
        "sector": 1
      },
      {
        "ring": 6,
        "sector": 4
      },
      {
        "ring": 6,
        "sector": 7
      },
      {
        "ring": 6,
        "sector": 9
      },
      {
        "ring": 6,
        "sector": 11
      }
    ],
    "portals": [
      {
        "ring": 2,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 10
      }
    ],
    "switches": [
      "2,6"
    ],
    "switchCells": [
      {
        "ring": 2,
        "sector": 6
      }
    ],
    "toggleBlocks": [
      "6,0",
      "0,7",
      "5,6",
      "3,4",
      "0,6"
    ],
    "toggleBlockCells": [
      {
        "ring": 6,
        "sector": 0
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 5,
        "sector": 6
      },
      {
        "ring": 3,
        "sector": 4
      },
      {
        "ring": 0,
        "sector": 6
      }
    ],
    "start": {
      "ring": 0,
      "sector": 5
    },
    "goal": {
      "ring": 5,
      "sector": 8
    },
    "par": 16,
    "solution": [
      "out",
      "cw",
      "out",
      "ccw",
      "in",
      "cw",
      "in",
      "cw",
      "out",
      "cw",
      "out",
      "cw",
      "in",
      "cw",
      "out",
      "cw"
    ],
    "solutionFeatures": [
      "portal",
      "toggle"
    ]
  },
  {
    "id": 28,
    "name": "불안정 핵",
    "subtitle": "고난도 · 포탈과 블록 온오프",
    "ringCount": 7,
    "blocks": [
      "0,4",
      "0,5",
      "0,7",
      "1,2",
      "1,4",
      "1,5",
      "2,2",
      "2,5",
      "2,7",
      "2,10",
      "2,11",
      "3,0",
      "3,3",
      "3,6",
      "4,9",
      "5,1",
      "5,11",
      "6,0",
      "6,4",
      "6,10"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 4
      },
      {
        "ring": 0,
        "sector": 5
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 2
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 1,
        "sector": 5
      },
      {
        "ring": 2,
        "sector": 2
      },
      {
        "ring": 2,
        "sector": 5
      },
      {
        "ring": 2,
        "sector": 7
      },
      {
        "ring": 2,
        "sector": 10
      },
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 3,
        "sector": 0
      },
      {
        "ring": 3,
        "sector": 3
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 9
      },
      {
        "ring": 5,
        "sector": 1
      },
      {
        "ring": 5,
        "sector": 11
      },
      {
        "ring": 6,
        "sector": 0
      },
      {
        "ring": 6,
        "sector": 4
      },
      {
        "ring": 6,
        "sector": 10
      }
    ],
    "portals": [
      {
        "ring": 4,
        "sector": 10
      },
      {
        "ring": 2,
        "sector": 3
      }
    ],
    "switches": [
      "2,8"
    ],
    "switchCells": [
      {
        "ring": 2,
        "sector": 8
      }
    ],
    "toggleBlocks": [
      "5,2",
      "6,3",
      "0,9",
      "1,1",
      "6,11",
      "3,2",
      "3,10"
    ],
    "toggleBlockCells": [
      {
        "ring": 5,
        "sector": 2
      },
      {
        "ring": 6,
        "sector": 3
      },
      {
        "ring": 0,
        "sector": 9
      },
      {
        "ring": 1,
        "sector": 1
      },
      {
        "ring": 6,
        "sector": 11
      },
      {
        "ring": 3,
        "sector": 2
      },
      {
        "ring": 3,
        "sector": 10
      }
    ],
    "start": {
      "ring": 3,
      "sector": 7
    },
    "goal": {
      "ring": 6,
      "sector": 2
    },
    "par": 17,
    "solution": [
      "cw",
      "in",
      "cw",
      "out",
      "cw",
      "out",
      "cw",
      "in",
      "cw",
      "out",
      "cw",
      "out",
      "ccw",
      "cw",
      "out",
      "ccw",
      "out"
    ],
    "solutionFeatures": [
      "toggle",
      "portal"
    ]
  },
  {
    "id": 29,
    "name": "사건의 지평선",
    "subtitle": "고난도 · 포탈과 블록 온오프",
    "ringCount": 7,
    "blocks": [
      "0,2",
      "0,6",
      "0,7",
      "1,0",
      "1,3",
      "1,6",
      "1,8",
      "2,6",
      "2,10",
      "3,10",
      "3,11",
      "4,3",
      "4,5",
      "4,6",
      "4,9",
      "5,3",
      "5,7",
      "6,0",
      "6,4",
      "6,5",
      "6,9"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 2
      },
      {
        "ring": 0,
        "sector": 6
      },
      {
        "ring": 0,
        "sector": 7
      },
      {
        "ring": 1,
        "sector": 0
      },
      {
        "ring": 1,
        "sector": 3
      },
      {
        "ring": 1,
        "sector": 6
      },
      {
        "ring": 1,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 6
      },
      {
        "ring": 2,
        "sector": 10
      },
      {
        "ring": 3,
        "sector": 10
      },
      {
        "ring": 3,
        "sector": 11
      },
      {
        "ring": 4,
        "sector": 3
      },
      {
        "ring": 4,
        "sector": 5
      },
      {
        "ring": 4,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 9
      },
      {
        "ring": 5,
        "sector": 3
      },
      {
        "ring": 5,
        "sector": 7
      },
      {
        "ring": 6,
        "sector": 0
      },
      {
        "ring": 6,
        "sector": 4
      },
      {
        "ring": 6,
        "sector": 5
      },
      {
        "ring": 6,
        "sector": 9
      }
    ],
    "portals": [
      {
        "ring": 6,
        "sector": 7
      },
      {
        "ring": 2,
        "sector": 2
      }
    ],
    "switches": [
      "2,11"
    ],
    "switchCells": [
      {
        "ring": 2,
        "sector": 11
      }
    ],
    "toggleBlocks": [
      "3,0",
      "5,10",
      "2,9",
      "6,6",
      "4,4"
    ],
    "toggleBlockCells": [
      {
        "ring": 3,
        "sector": 0
      },
      {
        "ring": 5,
        "sector": 10
      },
      {
        "ring": 2,
        "sector": 9
      },
      {
        "ring": 6,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 4
      }
    ],
    "start": {
      "ring": 4,
      "sector": 11
    },
    "goal": {
      "ring": 1,
      "sector": 4
    },
    "par": 16,
    "solution": [
      "cw",
      "in",
      "cw",
      "ccw",
      "cw",
      "in",
      "cw",
      "out",
      "ccw",
      "out",
      "cw",
      "in",
      "ccw",
      "in",
      "ccw",
      "in"
    ],
    "solutionFeatures": [
      "portal",
      "toggle"
    ]
  },
  {
    "id": 30,
    "name": "에테르 특이점",
    "subtitle": "고난도 · 포탈과 블록 온오프",
    "ringCount": 7,
    "blocks": [
      "0,1",
      "1,1",
      "1,4",
      "1,8",
      "2,1",
      "2,5",
      "2,11",
      "3,3",
      "3,6",
      "3,8",
      "3,9",
      "3,10",
      "3,11",
      "4,2",
      "4,6",
      "4,8",
      "4,9",
      "5,0",
      "6,1",
      "6,4",
      "6,10"
    ],
    "blockCells": [
      {
        "ring": 0,
        "sector": 1
      },
      {
        "ring": 1,
        "sector": 1
      },
      {
        "ring": 1,
        "sector": 4
      },
      {
        "ring": 1,
        "sector": 8
      },
      {
        "ring": 2,
        "sector": 1
      },
      {
        "ring": 2,
        "sector": 5
      },
      {
        "ring": 2,
        "sector": 11
      },
      {
        "ring": 3,
        "sector": 3
      },
      {
        "ring": 3,
        "sector": 6
      },
      {
        "ring": 3,
        "sector": 8
      },
      {
        "ring": 3,
        "sector": 9
      },
      {
        "ring": 3,
        "sector": 10
      },
      {
        "ring": 3,
        "sector": 11
      },
      {
        "ring": 4,
        "sector": 2
      },
      {
        "ring": 4,
        "sector": 6
      },
      {
        "ring": 4,
        "sector": 8
      },
      {
        "ring": 4,
        "sector": 9
      },
      {
        "ring": 5,
        "sector": 0
      },
      {
        "ring": 6,
        "sector": 1
      },
      {
        "ring": 6,
        "sector": 4
      },
      {
        "ring": 6,
        "sector": 10
      }
    ],
    "portals": [
      {
        "ring": 2,
        "sector": 2
      },
      {
        "ring": 1,
        "sector": 2
      }
    ],
    "switches": [
      "5,5"
    ],
    "switchCells": [
      {
        "ring": 5,
        "sector": 5
      }
    ],
    "toggleBlocks": [
      "1,10",
      "0,8",
      "5,8",
      "5,4",
      "0,0",
      "5,3"
    ],
    "toggleBlockCells": [
      {
        "ring": 1,
        "sector": 10
      },
      {
        "ring": 0,
        "sector": 8
      },
      {
        "ring": 5,
        "sector": 8
      },
      {
        "ring": 5,
        "sector": 4
      },
      {
        "ring": 0,
        "sector": 0
      },
      {
        "ring": 5,
        "sector": 3
      }
    ],
    "start": {
      "ring": 5,
      "sector": 6
    },
    "goal": {
      "ring": 6,
      "sector": 2
    },
    "par": 16,
    "solution": [
      "ccw",
      "in",
      "out",
      "in",
      "ccw",
      "in",
      "ccw",
      "cw",
      "ccw",
      "out",
      "ccw",
      "out",
      "cw",
      "out",
      "cw",
      "out"
    ],
    "solutionFeatures": [
      "toggle",
      "portal"
    ]
  }
];
