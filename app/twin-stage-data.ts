// 확정·검증된 웜홀 맵 데이터입니다. 브라우저에서는 맵을 다시 생성하거나 검증하지 않습니다.
export const TWIN_STAGE_DATA = [
  {
    "id": 1,
    "left": {
      "cols": 4,
      "rows": 4,
      "blocks": [
        "0,0",
        "1,2",
        "3,2"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 3,
          "row": 2
        }
      ],
      "start": {
        "col": 1,
        "row": 0
      },
      "goal": {
        "col": 1,
        "row": 1
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 4,
      "rows": 4,
      "blocks": [
        "1,2",
        "1,3"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 1,
          "row": 3
        }
      ],
      "start": {
        "col": 3,
        "row": 0
      },
      "goal": {
        "col": 3,
        "row": 1
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 1,
    "solution": [
      "down"
    ],
    "parOffset": 0,
    "gimmick": null
  },
  {
    "id": 2,
    "left": {
      "cols": 4,
      "rows": 4,
      "blocks": [
        "0,3",
        "2,3"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 3
        },
        {
          "col": 2,
          "row": 3
        }
      ],
      "start": {
        "col": 2,
        "row": 2
      },
      "goal": {
        "col": 2,
        "row": 0
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 4,
      "rows": 4,
      "blocks": [
        "1,1"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 1
        }
      ],
      "start": {
        "col": 2,
        "row": 2
      },
      "goal": {
        "col": 1,
        "row": 0
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 2,
    "solution": [
      "up",
      "left"
    ],
    "parOffset": 0,
    "gimmick": null
  },
  {
    "id": 3,
    "left": {
      "cols": 4,
      "rows": 4,
      "blocks": [
        "1,3",
        "2,3"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 2,
          "row": 3
        }
      ],
      "start": {
        "col": 0,
        "row": 2
      },
      "goal": {
        "col": 0,
        "row": 3
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 4,
      "rows": 4,
      "blocks": [
        "3,0",
        "0,1",
        "2,1"
      ],
      "blockCells": [
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 2,
          "row": 1
        }
      ],
      "start": {
        "col": 2,
        "row": 3
      },
      "goal": {
        "col": 1,
        "row": 2
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 3,
    "solution": [
      "up",
      "left",
      "down"
    ],
    "parOffset": 0,
    "gimmick": null
  },
  {
    "id": 4,
    "left": {
      "cols": 5,
      "rows": 4,
      "blocks": [
        "0,3",
        "2,3"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 3
        },
        {
          "col": 2,
          "row": 3
        }
      ],
      "start": {
        "col": 3,
        "row": 3
      },
      "goal": {
        "col": 3,
        "row": 2
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 5,
      "rows": 4,
      "blocks": [
        "2,2",
        "4,2"
      ],
      "blockCells": [
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        }
      ],
      "start": {
        "col": 3,
        "row": 2
      },
      "goal": {
        "col": 3,
        "row": 0
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 1,
    "solution": [
      "up"
    ],
    "parOffset": 0,
    "gimmick": null
  },
  {
    "id": 5,
    "left": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "1,0",
        "3,0",
        "0,4",
        "4,4"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 0,
          "row": 4
        },
        {
          "col": 4,
          "row": 4
        }
      ],
      "start": {
        "col": 2,
        "row": 3
      },
      "goal": {
        "col": 4,
        "row": 2
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "0,0",
        "0,1",
        "1,1",
        "2,2",
        "4,2",
        "0,3",
        "4,4"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 0,
          "row": 3
        },
        {
          "col": 4,
          "row": 4
        }
      ],
      "start": {
        "col": 0,
        "row": 2
      },
      "goal": {
        "col": 1,
        "row": 2
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 2,
    "solution": [
      "right",
      "up"
    ],
    "parOffset": 0,
    "gimmick": null
  },
  {
    "id": 6,
    "left": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "1,1",
        "0,2",
        "1,2",
        "2,2",
        "4,2",
        "1,3",
        "3,3",
        "2,4",
        "3,4"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 2,
          "row": 4
        },
        {
          "col": 3,
          "row": 4
        }
      ],
      "start": {
        "col": 0,
        "row": 0
      },
      "goal": {
        "col": 2,
        "row": 1
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "2,1",
        "4,3",
        "0,4"
      ],
      "blockCells": [
        {
          "col": 2,
          "row": 1
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        }
      ],
      "start": {
        "col": 3,
        "row": 3
      },
      "goal": {
        "col": 0,
        "row": 1
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 5,
    "solution": [
      "up",
      "right",
      "down",
      "left",
      "up"
    ],
    "parOffset": 2,
    "gimmick": null
  },
  {
    "id": 7,
    "left": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "0,1",
        "3,1",
        "2,2",
        "3,4"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 3,
          "row": 4
        }
      ],
      "start": {
        "col": 3,
        "row": 3
      },
      "goal": {
        "col": 4,
        "row": 3
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "1,1",
        "2,2",
        "2,3",
        "3,3",
        "4,3",
        "3,4"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 3,
          "row": 4
        }
      ],
      "start": {
        "col": 1,
        "row": 4
      },
      "goal": {
        "col": 3,
        "row": 2
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 6,
    "solution": [
      "up",
      "left",
      "up",
      "right",
      "down",
      "left"
    ],
    "parOffset": 3,
    "gimmick": null
  },
  {
    "id": 8,
    "left": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "1,0",
        "4,0",
        "0,2",
        "1,2",
        "0,3",
        "3,3"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 0,
          "row": 3
        },
        {
          "col": 3,
          "row": 3
        }
      ],
      "start": {
        "col": 3,
        "row": 4
      },
      "goal": {
        "col": 2,
        "row": 1
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "0,1",
        "1,1",
        "3,2"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 3,
          "row": 2
        }
      ],
      "start": {
        "col": 0,
        "row": 0
      },
      "goal": {
        "col": 2,
        "row": 1
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 7,
    "solution": [
      "right",
      "down",
      "left",
      "up",
      "right",
      "up",
      "left"
    ],
    "parOffset": 4,
    "gimmick": null
  },
  {
    "id": 9,
    "left": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "3,0",
        "3,1",
        "4,4"
      ],
      "blockCells": [
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 4,
          "row": 4
        }
      ],
      "start": {
        "col": 1,
        "row": 4
      },
      "goal": {
        "col": 3,
        "row": 3
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "4,0",
        "0,1",
        "1,1",
        "1,4",
        "2,4",
        "3,4"
      ],
      "blockCells": [
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 2,
          "row": 4
        },
        {
          "col": 3,
          "row": 4
        }
      ],
      "start": {
        "col": 1,
        "row": 2
      },
      "goal": {
        "col": 3,
        "row": 0
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 5,
    "solution": [
      "right",
      "up",
      "left",
      "up",
      "right"
    ],
    "parOffset": 2,
    "gimmick": null
  },
  {
    "id": 10,
    "left": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "1,0",
        "2,0",
        "4,1",
        "2,3",
        "4,3"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 2,
          "row": 0
        },
        {
          "col": 4,
          "row": 1
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 4,
          "row": 3
        }
      ],
      "start": {
        "col": 1,
        "row": 1
      },
      "goal": {
        "col": 4,
        "row": 4
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 5,
      "rows": 5,
      "blocks": [
        "0,1",
        "3,1",
        "2,2",
        "4,3",
        "4,4"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 4,
          "row": 4
        }
      ],
      "start": {
        "col": 3,
        "row": 4
      },
      "goal": {
        "col": 0,
        "row": 0
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 6,
    "solution": [
      "up",
      "right",
      "up",
      "left",
      "down",
      "right"
    ],
    "parOffset": 3,
    "gimmick": null
  },
  {
    "id": 11,
    "left": {
      "cols": 6,
      "rows": 6,
      "blocks": [
        "0,0",
        "1,0",
        "2,0",
        "1,1",
        "1,2",
        "1,3",
        "2,3",
        "3,3",
        "1,4",
        "5,4",
        "2,5",
        "4,5"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 2,
          "row": 0
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 5,
          "row": 4
        },
        {
          "col": 2,
          "row": 5
        },
        {
          "col": 4,
          "row": 5
        }
      ],
      "start": {
        "col": 3,
        "row": 1
      },
      "goal": {
        "col": 5,
        "row": 3
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 6,
      "rows": 6,
      "blocks": [
        "5,1",
        "1,2",
        "3,2",
        "1,3",
        "2,3",
        "4,3",
        "0,4",
        "4,5",
        "5,5"
      ],
      "blockCells": [
        {
          "col": 5,
          "row": 1
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 3,
          "row": 2
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        },
        {
          "col": 4,
          "row": 5
        },
        {
          "col": 5,
          "row": 5
        }
      ],
      "start": {
        "col": 3,
        "row": 0
      },
      "goal": {
        "col": 3,
        "row": 3
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 9,
    "solution": [
      "down",
      "right",
      "down",
      "right",
      "down",
      "left",
      "down",
      "right",
      "up"
    ],
    "parOffset": 4,
    "gimmick": null
  },
  {
    "id": 12,
    "left": {
      "cols": 6,
      "rows": 6,
      "blocks": [
        "5,1",
        "2,2",
        "4,2",
        "2,3",
        "5,3",
        "2,4",
        "2,5"
      ],
      "blockCells": [
        {
          "col": 5,
          "row": 1
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 5,
          "row": 3
        },
        {
          "col": 2,
          "row": 4
        },
        {
          "col": 2,
          "row": 5
        }
      ],
      "start": {
        "col": 0,
        "row": 3
      },
      "goal": {
        "col": 2,
        "row": 0
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 6,
      "rows": 6,
      "blocks": [
        "2,0",
        "2,2",
        "3,2",
        "4,2",
        "0,3",
        "2,3",
        "5,3"
      ],
      "blockCells": [
        {
          "col": 2,
          "row": 0
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 3,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 0,
          "row": 3
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 5,
          "row": 3
        }
      ],
      "start": {
        "col": 2,
        "row": 1
      },
      "goal": {
        "col": 2,
        "row": 4
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 7,
    "solution": [
      "left",
      "up",
      "right",
      "down",
      "left",
      "up",
      "right"
    ],
    "parOffset": 2,
    "gimmick": null
  },
  {
    "id": 13,
    "left": {
      "cols": 6,
      "rows": 6,
      "blocks": [
        "0,1",
        "3,1",
        "0,2",
        "1,2",
        "3,2",
        "3,3",
        "4,3",
        "5,4",
        "3,5"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 3,
          "row": 2
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 5,
          "row": 4
        },
        {
          "col": 3,
          "row": 5
        }
      ],
      "start": {
        "col": 4,
        "row": 4
      },
      "goal": {
        "col": 5,
        "row": 1
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 6,
      "rows": 6,
      "blocks": [
        "2,0",
        "3,0",
        "0,1",
        "3,3",
        "2,4",
        "0,5"
      ],
      "blockCells": [
        {
          "col": 2,
          "row": 0
        },
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 2,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        }
      ],
      "start": {
        "col": 4,
        "row": 4
      },
      "goal": {
        "col": 1,
        "row": 3
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 8,
    "solution": [
      "left",
      "up",
      "right",
      "up",
      "right",
      "down",
      "left",
      "up"
    ],
    "parOffset": 3,
    "gimmick": null
  },
  {
    "id": 14,
    "left": {
      "cols": 6,
      "rows": 6,
      "blocks": [
        "3,1",
        "0,2",
        "5,2",
        "1,3",
        "2,3",
        "0,4"
      ],
      "blockCells": [
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 5,
          "row": 2
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        }
      ],
      "start": {
        "col": 1,
        "row": 4
      },
      "goal": {
        "col": 3,
        "row": 0
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 6,
      "rows": 6,
      "blocks": [
        "2,0",
        "1,1",
        "3,1",
        "1,3",
        "4,3",
        "3,4",
        "0,5",
        "2,5",
        "3,5",
        "5,5"
      ],
      "blockCells": [
        {
          "col": 2,
          "row": 0
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 2,
          "row": 5
        },
        {
          "col": 3,
          "row": 5
        },
        {
          "col": 5,
          "row": 5
        }
      ],
      "start": {
        "col": 2,
        "row": 2
      },
      "goal": {
        "col": 1,
        "row": 4
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 9,
    "solution": [
      "down",
      "left",
      "right",
      "up",
      "left",
      "up",
      "left",
      "up",
      "right"
    ],
    "parOffset": 4,
    "gimmick": null
  },
  {
    "id": 15,
    "left": {
      "cols": 6,
      "rows": 6,
      "blocks": [
        "0,0",
        "4,1",
        "2,2",
        "4,2",
        "5,2",
        "1,3",
        "3,3",
        "5,4"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 4,
          "row": 1
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 5,
          "row": 2
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 5,
          "row": 4
        }
      ],
      "start": {
        "col": 1,
        "row": 4
      },
      "goal": {
        "col": 3,
        "row": 2
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 6,
      "rows": 6,
      "blocks": [
        "0,0",
        "4,3",
        "1,4",
        "2,4",
        "2,5",
        "3,5",
        "4,5"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 2,
          "row": 4
        },
        {
          "col": 2,
          "row": 5
        },
        {
          "col": 3,
          "row": 5
        },
        {
          "col": 4,
          "row": 5
        }
      ],
      "start": {
        "col": 5,
        "row": 1
      },
      "goal": {
        "col": 3,
        "row": 2
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 9,
    "solution": [
      "up",
      "left",
      "down",
      "right",
      "up",
      "left",
      "up",
      "right",
      "down"
    ],
    "parOffset": 2,
    "gimmick": null
  },
  {
    "id": 16,
    "left": {
      "cols": 7,
      "rows": 7,
      "blocks": [
        "0,0",
        "2,0",
        "2,1",
        "5,1",
        "0,2",
        "0,3",
        "4,4",
        "0,5",
        "6,5",
        "2,6"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 2,
          "row": 0
        },
        {
          "col": 2,
          "row": 1
        },
        {
          "col": 5,
          "row": 1
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 0,
          "row": 3
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 6,
          "row": 5
        },
        {
          "col": 2,
          "row": 6
        }
      ],
      "start": {
        "col": 6,
        "row": 6
      },
      "goal": {
        "col": 1,
        "row": 4
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 7,
      "rows": 7,
      "blocks": [
        "1,0",
        "5,0",
        "6,0",
        "3,1",
        "4,2",
        "6,2",
        "0,3",
        "1,3",
        "2,3",
        "3,3",
        "6,3",
        "0,4",
        "3,4",
        "0,6"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 5,
          "row": 0
        },
        {
          "col": 6,
          "row": 0
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 6,
          "row": 2
        },
        {
          "col": 0,
          "row": 3
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 6,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 0,
          "row": 6
        }
      ],
      "start": {
        "col": 3,
        "row": 6
      },
      "goal": {
        "col": 0,
        "row": 1
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 14,
    "solution": [
      "right",
      "up",
      "left",
      "up",
      "right",
      "up",
      "right",
      "down",
      "left",
      "up",
      "left",
      "down",
      "left",
      "up"
    ],
    "parOffset": 3,
    "gimmick": null
  },
  {
    "id": 17,
    "left": {
      "cols": 7,
      "rows": 7,
      "blocks": [
        "4,0",
        "2,1",
        "1,2",
        "2,2",
        "4,2",
        "5,2",
        "1,3",
        "1,4",
        "5,4",
        "0,5",
        "3,6",
        "5,6"
      ],
      "blockCells": [
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 2,
          "row": 1
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 5,
          "row": 2
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 5,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        }
      ],
      "start": {
        "col": 0,
        "row": 4
      },
      "goal": {
        "col": 1,
        "row": 0
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 7,
      "rows": 7,
      "blocks": [
        "4,0",
        "1,1",
        "1,2",
        "2,2",
        "3,2",
        "5,2",
        "6,2",
        "5,3",
        "3,4",
        "6,4",
        "1,5",
        "4,5",
        "4,6",
        "5,6"
      ],
      "blockCells": [
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 3,
          "row": 2
        },
        {
          "col": 5,
          "row": 2
        },
        {
          "col": 6,
          "row": 2
        },
        {
          "col": 5,
          "row": 3
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 6,
          "row": 4
        },
        {
          "col": 1,
          "row": 5
        },
        {
          "col": 4,
          "row": 5
        },
        {
          "col": 4,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        }
      ],
      "start": {
        "col": 6,
        "row": 6
      },
      "goal": {
        "col": 2,
        "row": 3
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 14,
    "solution": [
      "up",
      "left",
      "up",
      "left",
      "up",
      "left",
      "up",
      "left",
      "down",
      "right",
      "up",
      "left",
      "up",
      "right"
    ],
    "parOffset": 4,
    "gimmick": null
  },
  {
    "id": 18,
    "left": {
      "cols": 7,
      "rows": 7,
      "blocks": [
        "4,0",
        "1,1",
        "2,1",
        "5,1",
        "2,2",
        "3,2",
        "6,2",
        "3,3",
        "2,4",
        "5,4",
        "6,4",
        "3,5",
        "0,6",
        "4,6",
        "5,6"
      ],
      "blockCells": [
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 2,
          "row": 1
        },
        {
          "col": 5,
          "row": 1
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 3,
          "row": 2
        },
        {
          "col": 6,
          "row": 2
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 2,
          "row": 4
        },
        {
          "col": 5,
          "row": 4
        },
        {
          "col": 6,
          "row": 4
        },
        {
          "col": 3,
          "row": 5
        },
        {
          "col": 0,
          "row": 6
        },
        {
          "col": 4,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        }
      ],
      "start": {
        "col": 2,
        "row": 6
      },
      "goal": {
        "col": 1,
        "row": 2
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 7,
      "rows": 7,
      "blocks": [
        "1,0",
        "4,0",
        "0,1",
        "2,2",
        "5,3",
        "1,4",
        "4,4",
        "6,4",
        "1,6",
        "4,6",
        "5,6"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 5,
          "row": 3
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 6,
          "row": 4
        },
        {
          "col": 1,
          "row": 6
        },
        {
          "col": 4,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        }
      ],
      "start": {
        "col": 0,
        "row": 4
      },
      "goal": {
        "col": 2,
        "row": 4
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 12,
    "solution": [
      "left",
      "up",
      "right",
      "up",
      "right",
      "up",
      "left",
      "down",
      "left",
      "down",
      "left",
      "up"
    ],
    "parOffset": 2,
    "gimmick": null
  },
  {
    "id": 19,
    "left": {
      "cols": 7,
      "rows": 7,
      "blocks": [
        "5,1",
        "4,2",
        "6,2",
        "3,3",
        "0,4",
        "3,4",
        "2,6"
      ],
      "blockCells": [
        {
          "col": 5,
          "row": 1
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 6,
          "row": 2
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 2,
          "row": 6
        }
      ],
      "start": {
        "col": 3,
        "row": 6
      },
      "goal": {
        "col": 2,
        "row": 2
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 7,
      "rows": 7,
      "blocks": [
        "0,0",
        "3,0",
        "2,1",
        "6,1",
        "2,3",
        "4,3",
        "3,4",
        "1,5",
        "3,5",
        "6,5",
        "0,6"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 2,
          "row": 1
        },
        {
          "col": 6,
          "row": 1
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 1,
          "row": 5
        },
        {
          "col": 3,
          "row": 5
        },
        {
          "col": 6,
          "row": 5
        },
        {
          "col": 0,
          "row": 6
        }
      ],
      "start": {
        "col": 4,
        "row": 5
      },
      "goal": {
        "col": 5,
        "row": 3
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 13,
    "solution": [
      "right",
      "up",
      "down",
      "left",
      "up",
      "left",
      "down",
      "right",
      "up",
      "left",
      "down",
      "right",
      "up"
    ],
    "parOffset": 3,
    "gimmick": null
  },
  {
    "id": 20,
    "left": {
      "cols": 7,
      "rows": 7,
      "blocks": [
        "0,0",
        "6,0",
        "6,2",
        "5,3",
        "3,4",
        "2,5",
        "4,5",
        "5,5",
        "0,6",
        "4,6",
        "5,6"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 6,
          "row": 0
        },
        {
          "col": 6,
          "row": 2
        },
        {
          "col": 5,
          "row": 3
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 2,
          "row": 5
        },
        {
          "col": 4,
          "row": 5
        },
        {
          "col": 5,
          "row": 5
        },
        {
          "col": 0,
          "row": 6
        },
        {
          "col": 4,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        }
      ],
      "start": {
        "col": 4,
        "row": 1
      },
      "goal": {
        "col": 3,
        "row": 1
      },
      "switchCell": null,
      "gateCell": null
    },
    "right": {
      "cols": 7,
      "rows": 7,
      "blocks": [
        "2,0",
        "3,0",
        "0,2",
        "4,2",
        "1,3",
        "5,3",
        "3,4",
        "4,4",
        "0,5",
        "5,5",
        "2,6",
        "5,6"
      ],
      "blockCells": [
        {
          "col": 2,
          "row": 0
        },
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 5,
          "row": 3
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 5,
          "row": 5
        },
        {
          "col": 2,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        }
      ],
      "start": {
        "col": 6,
        "row": 5
      },
      "goal": {
        "col": 1,
        "row": 6
      },
      "switchCell": null,
      "gateCell": null
    },
    "par": 14,
    "solution": [
      "left",
      "up",
      "left",
      "down",
      "left",
      "up",
      "right",
      "down",
      "right",
      "down",
      "left",
      "down",
      "left",
      "down"
    ],
    "parOffset": 4,
    "gimmick": null
  },
  {
    "id": 21,
    "left": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "5,0",
        "1,1",
        "4,1",
        "7,1",
        "3,2",
        "4,2",
        "5,2",
        "2,3",
        "4,3",
        "7,3",
        "4,4",
        "6,4",
        "4,5",
        "7,6",
        "8,6",
        "1,7",
        "2,7",
        "5,7"
      ],
      "blockCells": [
        {
          "col": 5,
          "row": 0
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 4,
          "row": 1
        },
        {
          "col": 7,
          "row": 1
        },
        {
          "col": 3,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 5,
          "row": 2
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 7,
          "row": 3
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 6,
          "row": 4
        },
        {
          "col": 4,
          "row": 5
        },
        {
          "col": 7,
          "row": 6
        },
        {
          "col": 8,
          "row": 6
        },
        {
          "col": 1,
          "row": 7
        },
        {
          "col": 2,
          "row": 7
        },
        {
          "col": 5,
          "row": 7
        }
      ],
      "start": {
        "col": 3,
        "row": 4
      },
      "goal": {
        "col": 6,
        "row": 7
      },
      "switchCell": null,
      "gateCell": {
        "col": 6,
        "row": 0
      }
    },
    "right": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "0,1",
        "5,3",
        "1,4",
        "2,4",
        "6,4",
        "0,5",
        "4,5",
        "3,6",
        "7,6"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 5,
          "row": 3
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 2,
          "row": 4
        },
        {
          "col": 6,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 4,
          "row": 5
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 7,
          "row": 6
        }
      ],
      "start": {
        "col": 2,
        "row": 5
      },
      "goal": {
        "col": 2,
        "row": 3
      },
      "switchCell": {
        "col": 1,
        "row": 0
      },
      "gateCell": null
    },
    "par": 15,
    "solution": [
      "down",
      "right",
      "up",
      "left",
      "right",
      "up",
      "right",
      "up",
      "left",
      "down",
      "right",
      "left",
      "down",
      "right",
      "down"
    ],
    "parOffset": 0,
    "gimmick": "resonance-gate"
  },
  {
    "id": 22,
    "left": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "4,0",
        "5,0",
        "6,0",
        "8,0",
        "1,1",
        "7,1",
        "5,2",
        "7,2",
        "8,2",
        "0,3",
        "6,3",
        "7,3",
        "4,4",
        "7,4",
        "1,5",
        "4,5",
        "7,5",
        "8,5",
        "0,6",
        "3,6",
        "4,6",
        "6,6",
        "0,7",
        "1,7",
        "3,7",
        "4,7"
      ],
      "blockCells": [
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 5,
          "row": 0
        },
        {
          "col": 6,
          "row": 0
        },
        {
          "col": 8,
          "row": 0
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 7,
          "row": 1
        },
        {
          "col": 5,
          "row": 2
        },
        {
          "col": 7,
          "row": 2
        },
        {
          "col": 8,
          "row": 2
        },
        {
          "col": 0,
          "row": 3
        },
        {
          "col": 6,
          "row": 3
        },
        {
          "col": 7,
          "row": 3
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 7,
          "row": 4
        },
        {
          "col": 1,
          "row": 5
        },
        {
          "col": 4,
          "row": 5
        },
        {
          "col": 7,
          "row": 5
        },
        {
          "col": 8,
          "row": 5
        },
        {
          "col": 0,
          "row": 6
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 4,
          "row": 6
        },
        {
          "col": 6,
          "row": 6
        },
        {
          "col": 0,
          "row": 7
        },
        {
          "col": 1,
          "row": 7
        },
        {
          "col": 3,
          "row": 7
        },
        {
          "col": 4,
          "row": 7
        }
      ],
      "start": {
        "col": 3,
        "row": 1
      },
      "goal": {
        "col": 1,
        "row": 4
      },
      "switchCell": null,
      "gateCell": {
        "col": 1,
        "row": 2
      }
    },
    "right": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "2,1",
        "3,1",
        "5,1",
        "4,2",
        "2,5",
        "5,5",
        "8,5",
        "1,6",
        "5,6",
        "3,7",
        "8,7"
      ],
      "blockCells": [
        {
          "col": 2,
          "row": 1
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 5,
          "row": 1
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 2,
          "row": 5
        },
        {
          "col": 5,
          "row": 5
        },
        {
          "col": 8,
          "row": 5
        },
        {
          "col": 1,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        },
        {
          "col": 3,
          "row": 7
        },
        {
          "col": 8,
          "row": 7
        }
      ],
      "start": {
        "col": 2,
        "row": 7
      },
      "goal": {
        "col": 4,
        "row": 5
      },
      "switchCell": {
        "col": 1,
        "row": 4
      },
      "gateCell": null
    },
    "par": 16,
    "solution": [
      "left",
      "up",
      "right",
      "down",
      "left",
      "up",
      "left",
      "down",
      "right",
      "down",
      "left",
      "down",
      "right",
      "up",
      "right",
      "up"
    ],
    "parOffset": 0,
    "gimmick": "resonance-gate"
  },
  {
    "id": 23,
    "left": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "6,0",
        "0,1",
        "4,1",
        "6,1",
        "2,2",
        "5,3",
        "6,3",
        "8,3",
        "4,4",
        "0,5",
        "5,5",
        "6,5",
        "2,6",
        "4,6",
        "5,6",
        "1,7",
        "3,7",
        "4,7"
      ],
      "blockCells": [
        {
          "col": 6,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 4,
          "row": 1
        },
        {
          "col": 6,
          "row": 1
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 5,
          "row": 3
        },
        {
          "col": 6,
          "row": 3
        },
        {
          "col": 8,
          "row": 3
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 5,
          "row": 5
        },
        {
          "col": 6,
          "row": 5
        },
        {
          "col": 2,
          "row": 6
        },
        {
          "col": 4,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        },
        {
          "col": 1,
          "row": 7
        },
        {
          "col": 3,
          "row": 7
        },
        {
          "col": 4,
          "row": 7
        }
      ],
      "start": {
        "col": 8,
        "row": 1
      },
      "goal": {
        "col": 8,
        "row": 7
      },
      "switchCell": null,
      "gateCell": {
        "col": 8,
        "row": 0
      }
    },
    "right": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "0,0",
        "6,0",
        "5,1",
        "1,2",
        "4,2",
        "1,3",
        "7,3",
        "0,4",
        "3,4",
        "8,5",
        "3,6",
        "3,7",
        "6,7"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 6,
          "row": 0
        },
        {
          "col": 5,
          "row": 1
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 7,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 8,
          "row": 5
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 3,
          "row": 7
        },
        {
          "col": 6,
          "row": 7
        }
      ],
      "start": {
        "col": 7,
        "row": 2
      },
      "goal": {
        "col": 6,
        "row": 3
      },
      "switchCell": {
        "col": 8,
        "row": 7
      },
      "gateCell": null
    },
    "par": 17,
    "solution": [
      "right",
      "down",
      "left",
      "up",
      "left",
      "down",
      "left",
      "up",
      "right",
      "down",
      "right",
      "up",
      "left",
      "down",
      "left",
      "up",
      "right"
    ],
    "parOffset": 0,
    "gimmick": "resonance-gate"
  },
  {
    "id": 24,
    "left": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "1,0",
        "2,0",
        "4,0",
        "6,0",
        "8,0",
        "0,1",
        "3,1",
        "0,2",
        "2,2",
        "4,3",
        "8,4",
        "5,5",
        "5,6"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 2,
          "row": 0
        },
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 6,
          "row": 0
        },
        {
          "col": 8,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 8,
          "row": 4
        },
        {
          "col": 5,
          "row": 5
        },
        {
          "col": 5,
          "row": 6
        }
      ],
      "start": {
        "col": 4,
        "row": 5
      },
      "goal": {
        "col": 2,
        "row": 3
      },
      "switchCell": {
        "col": 5,
        "row": 4
      },
      "gateCell": null
    },
    "right": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "1,0",
        "3,0",
        "5,0",
        "0,1",
        "1,1",
        "2,1",
        "3,1",
        "7,1",
        "1,2",
        "2,2",
        "2,3",
        "7,3",
        "1,4",
        "4,4",
        "5,5",
        "6,5",
        "8,5",
        "0,6",
        "1,6",
        "3,6",
        "1,7",
        "2,7",
        "8,7"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 5,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 2,
          "row": 1
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 7,
          "row": 1
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 7,
          "row": 3
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 5,
          "row": 5
        },
        {
          "col": 6,
          "row": 5
        },
        {
          "col": 8,
          "row": 5
        },
        {
          "col": 0,
          "row": 6
        },
        {
          "col": 1,
          "row": 6
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 1,
          "row": 7
        },
        {
          "col": 2,
          "row": 7
        },
        {
          "col": 8,
          "row": 7
        }
      ],
      "start": {
        "col": 6,
        "row": 3
      },
      "goal": {
        "col": 8,
        "row": 1
      },
      "switchCell": null,
      "gateCell": {
        "col": 1,
        "row": 5
      }
    },
    "par": 18,
    "solution": [
      "up",
      "right",
      "left",
      "down",
      "left",
      "up",
      "right",
      "left",
      "down",
      "left",
      "down",
      "left",
      "right",
      "down",
      "right",
      "up",
      "right",
      "up"
    ],
    "parOffset": 0,
    "gimmick": "resonance-gate"
  },
  {
    "id": 25,
    "left": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "6,0",
        "0,1",
        "6,1",
        "1,2",
        "2,2",
        "5,3",
        "8,3",
        "0,4",
        "2,4",
        "3,4",
        "4,4",
        "0,5",
        "2,5",
        "7,5",
        "3,6",
        "5,6",
        "6,6",
        "8,6",
        "0,7",
        "4,7",
        "5,7",
        "6,7"
      ],
      "blockCells": [
        {
          "col": 6,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 6,
          "row": 1
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 5,
          "row": 3
        },
        {
          "col": 8,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        },
        {
          "col": 2,
          "row": 4
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 2,
          "row": 5
        },
        {
          "col": 7,
          "row": 5
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        },
        {
          "col": 6,
          "row": 6
        },
        {
          "col": 8,
          "row": 6
        },
        {
          "col": 0,
          "row": 7
        },
        {
          "col": 4,
          "row": 7
        },
        {
          "col": 5,
          "row": 7
        },
        {
          "col": 6,
          "row": 7
        }
      ],
      "start": {
        "col": 1,
        "row": 5
      },
      "goal": {
        "col": 5,
        "row": 5
      },
      "switchCell": {
        "col": 3,
        "row": 1
      },
      "gateCell": null
    },
    "right": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "0,0",
        "4,0",
        "6,0",
        "3,1",
        "5,2",
        "5,3",
        "5,4",
        "3,5",
        "6,5",
        "8,5",
        "1,7",
        "3,7"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 6,
          "row": 0
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 5,
          "row": 2
        },
        {
          "col": 5,
          "row": 3
        },
        {
          "col": 5,
          "row": 4
        },
        {
          "col": 3,
          "row": 5
        },
        {
          "col": 6,
          "row": 5
        },
        {
          "col": 8,
          "row": 5
        },
        {
          "col": 1,
          "row": 7
        },
        {
          "col": 3,
          "row": 7
        }
      ],
      "start": {
        "col": 6,
        "row": 7
      },
      "goal": {
        "col": 8,
        "row": 0
      },
      "switchCell": null,
      "gateCell": {
        "col": 5,
        "row": 7
      }
    },
    "par": 19,
    "solution": [
      "up",
      "right",
      "up",
      "right",
      "down",
      "left",
      "up",
      "up",
      "down",
      "left",
      "up",
      "right",
      "down",
      "right",
      "up",
      "left",
      "down",
      "left",
      "down"
    ],
    "parOffset": 0,
    "gimmick": "resonance-gate"
  },
  {
    "id": 26,
    "left": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "4,0",
        "5,0",
        "8,0",
        "0,1",
        "2,1",
        "3,1",
        "5,1",
        "3,2",
        "6,3",
        "7,3",
        "0,4",
        "1,5",
        "7,5",
        "8,5",
        "1,6",
        "5,6",
        "8,6",
        "3,7",
        "4,7"
      ],
      "blockCells": [
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 5,
          "row": 0
        },
        {
          "col": 8,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 2,
          "row": 1
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 5,
          "row": 1
        },
        {
          "col": 3,
          "row": 2
        },
        {
          "col": 6,
          "row": 3
        },
        {
          "col": 7,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        },
        {
          "col": 1,
          "row": 5
        },
        {
          "col": 7,
          "row": 5
        },
        {
          "col": 8,
          "row": 5
        },
        {
          "col": 1,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        },
        {
          "col": 8,
          "row": 6
        },
        {
          "col": 3,
          "row": 7
        },
        {
          "col": 4,
          "row": 7
        }
      ],
      "start": {
        "col": 6,
        "row": 5
      },
      "goal": {
        "col": 6,
        "row": 0
      },
      "switchCell": {
        "col": 1,
        "row": 7
      },
      "gateCell": null
    },
    "right": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "4,0",
        "5,0",
        "7,0",
        "4,1",
        "8,1",
        "0,2",
        "4,2",
        "3,3",
        "6,3",
        "0,4",
        "1,4",
        "3,4",
        "0,5",
        "2,5",
        "7,5",
        "0,6",
        "1,6",
        "3,6",
        "4,7"
      ],
      "blockCells": [
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 5,
          "row": 0
        },
        {
          "col": 7,
          "row": 0
        },
        {
          "col": 4,
          "row": 1
        },
        {
          "col": 8,
          "row": 1
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 6,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 2,
          "row": 5
        },
        {
          "col": 7,
          "row": 5
        },
        {
          "col": 0,
          "row": 6
        },
        {
          "col": 1,
          "row": 6
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 4,
          "row": 7
        }
      ],
      "start": {
        "col": 7,
        "row": 2
      },
      "goal": {
        "col": 6,
        "row": 2
      },
      "switchCell": null,
      "gateCell": {
        "col": 8,
        "row": 3
      }
    },
    "par": 20,
    "solution": [
      "up",
      "right",
      "up",
      "left",
      "down",
      "left",
      "down",
      "left",
      "down",
      "left",
      "right",
      "up",
      "left",
      "down",
      "right",
      "up",
      "right",
      "up",
      "left",
      "up"
    ],
    "parOffset": 0,
    "gimmick": "resonance-gate"
  },
  {
    "id": 27,
    "left": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "0,0",
        "1,0",
        "8,0",
        "0,1",
        "0,2",
        "3,2",
        "7,2",
        "3,3",
        "4,3",
        "1,4",
        "0,5",
        "1,5",
        "4,5",
        "0,6",
        "3,6",
        "8,6",
        "2,7",
        "3,7"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 8,
          "row": 0
        },
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 3,
          "row": 2
        },
        {
          "col": 7,
          "row": 2
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 1,
          "row": 5
        },
        {
          "col": 4,
          "row": 5
        },
        {
          "col": 0,
          "row": 6
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 8,
          "row": 6
        },
        {
          "col": 2,
          "row": 7
        },
        {
          "col": 3,
          "row": 7
        }
      ],
      "start": {
        "col": 6,
        "row": 4
      },
      "goal": {
        "col": 3,
        "row": 1
      },
      "switchCell": {
        "col": 1,
        "row": 7
      },
      "gateCell": null
    },
    "right": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "0,0",
        "5,0",
        "1,1",
        "1,2",
        "5,2",
        "8,2",
        "8,3",
        "4,5",
        "5,5",
        "3,6",
        "7,6",
        "8,6",
        "3,7",
        "8,7"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 5,
          "row": 0
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 5,
          "row": 2
        },
        {
          "col": 8,
          "row": 2
        },
        {
          "col": 8,
          "row": 3
        },
        {
          "col": 4,
          "row": 5
        },
        {
          "col": 5,
          "row": 5
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 7,
          "row": 6
        },
        {
          "col": 8,
          "row": 6
        },
        {
          "col": 3,
          "row": 7
        },
        {
          "col": 8,
          "row": 7
        }
      ],
      "start": {
        "col": 0,
        "row": 2
      },
      "goal": {
        "col": 7,
        "row": 1
      },
      "switchCell": null,
      "gateCell": {
        "col": 4,
        "row": 7
      }
    },
    "par": 21,
    "solution": [
      "left",
      "down",
      "left",
      "down",
      "right",
      "up",
      "right",
      "down",
      "right",
      "up",
      "right",
      "down",
      "left",
      "down",
      "left",
      "up",
      "right",
      "up",
      "right",
      "down",
      "left"
    ],
    "parOffset": 0,
    "gimmick": "resonance-gate"
  },
  {
    "id": 28,
    "left": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "3,0",
        "4,0",
        "7,0",
        "3,1",
        "4,1",
        "6,2",
        "2,3",
        "8,3",
        "1,4",
        "4,4",
        "5,4",
        "7,4",
        "3,5",
        "2,6",
        "5,6",
        "0,7",
        "4,7"
      ],
      "blockCells": [
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 7,
          "row": 0
        },
        {
          "col": 3,
          "row": 1
        },
        {
          "col": 4,
          "row": 1
        },
        {
          "col": 6,
          "row": 2
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 8,
          "row": 3
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 5,
          "row": 4
        },
        {
          "col": 7,
          "row": 4
        },
        {
          "col": 3,
          "row": 5
        },
        {
          "col": 2,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        },
        {
          "col": 0,
          "row": 7
        },
        {
          "col": 4,
          "row": 7
        }
      ],
      "start": {
        "col": 2,
        "row": 5
      },
      "goal": {
        "col": 0,
        "row": 3
      },
      "switchCell": null,
      "gateCell": {
        "col": 7,
        "row": 5
      }
    },
    "right": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "3,0",
        "4,0",
        "6,0",
        "7,0",
        "8,1",
        "3,2",
        "4,2",
        "2,3",
        "4,3",
        "8,3",
        "7,4",
        "3,5",
        "6,5",
        "2,6",
        "4,6",
        "0,7",
        "3,7",
        "4,7",
        "6,7",
        "7,7"
      ],
      "blockCells": [
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 4,
          "row": 0
        },
        {
          "col": 6,
          "row": 0
        },
        {
          "col": 7,
          "row": 0
        },
        {
          "col": 8,
          "row": 1
        },
        {
          "col": 3,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 2,
          "row": 3
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 8,
          "row": 3
        },
        {
          "col": 7,
          "row": 4
        },
        {
          "col": 3,
          "row": 5
        },
        {
          "col": 6,
          "row": 5
        },
        {
          "col": 2,
          "row": 6
        },
        {
          "col": 4,
          "row": 6
        },
        {
          "col": 0,
          "row": 7
        },
        {
          "col": 3,
          "row": 7
        },
        {
          "col": 4,
          "row": 7
        },
        {
          "col": 6,
          "row": 7
        },
        {
          "col": 7,
          "row": 7
        }
      ],
      "start": {
        "col": 5,
        "row": 3
      },
      "goal": {
        "col": 1,
        "row": 7
      },
      "switchCell": {
        "col": 1,
        "row": 0
      },
      "gateCell": null
    },
    "par": 22,
    "solution": [
      "right",
      "up",
      "left",
      "down",
      "left",
      "down",
      "right",
      "up",
      "down",
      "right",
      "up",
      "right",
      "up",
      "right",
      "left",
      "down",
      "left",
      "down",
      "left",
      "up",
      "left",
      "up"
    ],
    "parOffset": 0,
    "gimmick": "resonance-gate"
  },
  {
    "id": 29,
    "left": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "3,0",
        "7,0",
        "8,0",
        "7,1",
        "0,2",
        "1,2",
        "4,2",
        "8,2",
        "0,3",
        "6,3",
        "7,3",
        "0,4",
        "1,4",
        "4,4",
        "0,5",
        "3,5",
        "7,6",
        "8,6",
        "4,7",
        "7,7",
        "8,7"
      ],
      "blockCells": [
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 7,
          "row": 0
        },
        {
          "col": 8,
          "row": 0
        },
        {
          "col": 7,
          "row": 1
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 8,
          "row": 2
        },
        {
          "col": 0,
          "row": 3
        },
        {
          "col": 6,
          "row": 3
        },
        {
          "col": 7,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 3,
          "row": 5
        },
        {
          "col": 7,
          "row": 6
        },
        {
          "col": 8,
          "row": 6
        },
        {
          "col": 4,
          "row": 7
        },
        {
          "col": 7,
          "row": 7
        },
        {
          "col": 8,
          "row": 7
        }
      ],
      "start": {
        "col": 8,
        "row": 5
      },
      "goal": {
        "col": 6,
        "row": 4
      },
      "switchCell": {
        "col": 2,
        "row": 5
      },
      "gateCell": null
    },
    "right": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "0,0",
        "1,0",
        "6,1",
        "1,2",
        "2,2",
        "3,2",
        "4,2",
        "8,2",
        "1,3",
        "3,3",
        "7,3",
        "3,4",
        "4,4",
        "5,4",
        "7,4",
        "8,4",
        "4,5",
        "7,5",
        "8,5",
        "0,6",
        "2,6",
        "3,6",
        "4,6",
        "6,6",
        "8,6",
        "1,7",
        "2,7",
        "3,7",
        "5,7",
        "6,7"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 0
        },
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 6,
          "row": 1
        },
        {
          "col": 1,
          "row": 2
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 3,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 8,
          "row": 2
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 3,
          "row": 3
        },
        {
          "col": 7,
          "row": 3
        },
        {
          "col": 3,
          "row": 4
        },
        {
          "col": 4,
          "row": 4
        },
        {
          "col": 5,
          "row": 4
        },
        {
          "col": 7,
          "row": 4
        },
        {
          "col": 8,
          "row": 4
        },
        {
          "col": 4,
          "row": 5
        },
        {
          "col": 7,
          "row": 5
        },
        {
          "col": 8,
          "row": 5
        },
        {
          "col": 0,
          "row": 6
        },
        {
          "col": 2,
          "row": 6
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 4,
          "row": 6
        },
        {
          "col": 6,
          "row": 6
        },
        {
          "col": 8,
          "row": 6
        },
        {
          "col": 1,
          "row": 7
        },
        {
          "col": 2,
          "row": 7
        },
        {
          "col": 3,
          "row": 7
        },
        {
          "col": 5,
          "row": 7
        },
        {
          "col": 6,
          "row": 7
        }
      ],
      "start": {
        "col": 0,
        "row": 5
      },
      "goal": {
        "col": 5,
        "row": 3
      },
      "switchCell": null,
      "gateCell": {
        "col": 2,
        "row": 0
      }
    },
    "par": 23,
    "solution": [
      "left",
      "down",
      "right",
      "down",
      "left",
      "up",
      "left",
      "down",
      "left",
      "up",
      "right",
      "up",
      "right",
      "down",
      "up",
      "left",
      "down",
      "right",
      "down",
      "left",
      "down",
      "right",
      "up"
    ],
    "parOffset": 0,
    "gimmick": "resonance-gate"
  },
  {
    "id": 30,
    "left": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "1,0",
        "3,0",
        "1,1",
        "2,1",
        "5,1",
        "6,1",
        "7,1",
        "2,2",
        "8,2",
        "0,3",
        "1,3",
        "4,3",
        "7,3",
        "0,4",
        "2,4",
        "1,5",
        "5,5",
        "1,6",
        "3,6",
        "5,6",
        "6,6",
        "0,7",
        "3,7",
        "4,7"
      ],
      "blockCells": [
        {
          "col": 1,
          "row": 0
        },
        {
          "col": 3,
          "row": 0
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 2,
          "row": 1
        },
        {
          "col": 5,
          "row": 1
        },
        {
          "col": 6,
          "row": 1
        },
        {
          "col": 7,
          "row": 1
        },
        {
          "col": 2,
          "row": 2
        },
        {
          "col": 8,
          "row": 2
        },
        {
          "col": 0,
          "row": 3
        },
        {
          "col": 1,
          "row": 3
        },
        {
          "col": 4,
          "row": 3
        },
        {
          "col": 7,
          "row": 3
        },
        {
          "col": 0,
          "row": 4
        },
        {
          "col": 2,
          "row": 4
        },
        {
          "col": 1,
          "row": 5
        },
        {
          "col": 5,
          "row": 5
        },
        {
          "col": 1,
          "row": 6
        },
        {
          "col": 3,
          "row": 6
        },
        {
          "col": 5,
          "row": 6
        },
        {
          "col": 6,
          "row": 6
        },
        {
          "col": 0,
          "row": 7
        },
        {
          "col": 3,
          "row": 7
        },
        {
          "col": 4,
          "row": 7
        }
      ],
      "start": {
        "col": 7,
        "row": 6
      },
      "goal": {
        "col": 4,
        "row": 1
      },
      "switchCell": null,
      "gateCell": {
        "col": 2,
        "row": 7
      }
    },
    "right": {
      "cols": 9,
      "rows": 8,
      "blocks": [
        "0,1",
        "1,1",
        "6,1",
        "0,2",
        "4,2",
        "8,2",
        "1,4",
        "2,4",
        "0,5",
        "1,5",
        "4,5",
        "5,5",
        "8,5",
        "2,6",
        "6,6",
        "8,6",
        "0,7",
        "1,7",
        "4,7"
      ],
      "blockCells": [
        {
          "col": 0,
          "row": 1
        },
        {
          "col": 1,
          "row": 1
        },
        {
          "col": 6,
          "row": 1
        },
        {
          "col": 0,
          "row": 2
        },
        {
          "col": 4,
          "row": 2
        },
        {
          "col": 8,
          "row": 2
        },
        {
          "col": 1,
          "row": 4
        },
        {
          "col": 2,
          "row": 4
        },
        {
          "col": 0,
          "row": 5
        },
        {
          "col": 1,
          "row": 5
        },
        {
          "col": 4,
          "row": 5
        },
        {
          "col": 5,
          "row": 5
        },
        {
          "col": 8,
          "row": 5
        },
        {
          "col": 2,
          "row": 6
        },
        {
          "col": 6,
          "row": 6
        },
        {
          "col": 8,
          "row": 6
        },
        {
          "col": 0,
          "row": 7
        },
        {
          "col": 1,
          "row": 7
        },
        {
          "col": 4,
          "row": 7
        }
      ],
      "start": {
        "col": 4,
        "row": 3
      },
      "goal": {
        "col": 8,
        "row": 7
      },
      "switchCell": {
        "col": 2,
        "row": 7
      },
      "gateCell": null
    },
    "par": 25,
    "solution": [
      "up",
      "left",
      "down",
      "left",
      "up",
      "right",
      "down",
      "left",
      "down",
      "left",
      "up",
      "left",
      "down",
      "left",
      "down",
      "up",
      "right",
      "up",
      "left",
      "up",
      "right",
      "down",
      "left",
      "down",
      "right"
    ],
    "parOffset": 0,
    "gimmick": "resonance-gate"
  }
];
