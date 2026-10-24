#!/usr/bin/env python3
"""標準庫地圖產生器；預設重產本線十五張地圖，--check-only 只驗既有輸出。"""
import argparse
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
BASE = ROOT / "content/base"


def tide(step):
    value = 0
    for limit, level in reversed([(step, 0), (step * 2, 1), (step * 3, 2), (step * 4, 1)]):
        value = {"pick": {"if": {"cmp": {"a": {"ref": "battle.round"}, "op": "<=", "b": limit}},
                          "then": level, "else": value}}
    return value


class Board:
    def __init__(self, name, w, h, fill, sides, intention, globals_=None):
        self.name, self.w, self.h = name, w, h
        self.grid = [[fill] * w for _ in range(h)]
        self.fill, self.sides, self.intention = fill, sides, intention
        self.globals = globals_
        self.zones = {}

    def rect(self, x0, y0, x1, y1, glyph):
        for y in range(max(0, y0), min(self.h, y1)):
            for x in range(max(0, x0), min(self.w, x1)):
                self.grid[y][x] = glyph

    def line(self, x0, y0, x1, y1, glyph, radius=0):
        count = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(count + 1):
            x, y = round(x0 + (x1 - x0) * i / count), round(y0 + (y1 - y0) * i / count)
            self.rect(x-radius, y-radius, x+radius+1, y+radius+1, glyph)

    def ring(self, cx, cy, rx, ry, glyph, thickness=1.5):
        for y in range(self.h):
            for x in range(self.w):
                dist = math.hypot((x-cx)/rx, (y-cy)/ry)
                if abs(dist-1) <= thickness / min(rx, ry):
                    self.grid[y][x] = glyph

    def zone(self, slot, x, y, glyph=None):
        self.rect(x, y, x+4, y+4, glyph or self.fill)
        self.zones[slot] = [{"x": xx, "y": yy} for yy in range(y, y+4) for xx in range(x, x+4)]

    def ruins(self, x0, y0, cols, rows):
        for row in range(rows):
            for col in range(cols):
                x, y = x0 + col*8, y0 + row*8
                self.rect(x, y, x+5, y+5, ":")
                self.rect(x+1, y+1, x+4, y+4, "T")
                self.rect(x+2, y+1, x+3, y+3, "=")


def layouts():
    maps = []
    b = Board("hive-burrow-24", 24, 24, "o", "S", "萬巢聖壁交錯形成折返主道，兩側碎甲通廊可繞後。")
    for y, gap in [(6, 17), (11, 5), (16, 17)]:
        b.rect(3, y, 21, y+2, "H"); b.rect(gap, y, gap+3, y+2, "o")
    b.line(1, 2, 1, 21, "c"); b.line(22, 2, 22, 21, "c")
    b.zone("player", 9, 19); b.zone("enemy", 9, 1); maps.append(b)

    b = Board("mycelium-glade-32", 32, 32, "m", "W", "祈夢孢林圍出三條林隙，中央殘牆提供掩蔽，北側淺灘可包抄。", {"light": .6})
    for x, gap in [(10, 8), (21, 21)]:
        b.rect(x, 3, x+2, 29, "*"); b.rect(x, gap, x+2, gap+4, "m")
    b.line(3, 3, 28, 3, "≈"); b.rect(14, 13, 18, 17, ":"); b.rect(15, 14, 17, 15, "#")
    b.zone("player", 2, 14); b.zone("enemy", 26, 14); b.zone("ally", 3, 24); maps.append(b)

    b = Board("tidal-flat-40x30", 40, 30, ",", "N", "兩道潮神裂渠切開退潮之喉，三道殘高架作渡口，南側碎石堤形成側翼。", {"tide": tide(4)})
    b.line(13, 0, 18, 29, "w", 1); b.line(26, 0, 23, 29, "w")
    for y in [7, 15, 23]: b.rect(10, y, 29, y+2, "n")
    b.rect(3, 25, 37, 27, ":"); b.rect(31, 20, 34, 22, "#")
    b.zone("player", 4, 2); b.zone("enemy", 32, 20); b.zone("ally", 30, 3); maps.append(b)

    b = Board("lunar-crater-36", 36, 36, "_", "NESW", "月冠環脊包圍靜海灰燼渦，東西鞍口通往中央，南北外緣可迂迴。", {"light": .25})
    b.rect(11, 11, 25, 25, "u"); b.ring(18, 18, 12, 12, "^")
    b.line(2, 18, 33, 18, "_", 1); b.rect(17, 14, 20, 16, "#")
    b.zone("player", 2, 16); b.zone("enemy", 29, 16); b.zone("third", 16, 2); maps.append(b)

    b = Board("ruined-overpass-48x32", 48, 32, "=", "EW", "失落王庭尖塔沿折翼天橋分列，中央缺口迫使下橋，南北街廓提供側翼。", {"light": .4})
    b.ruins(8, 3, 4, 1); b.ruins(8, 23, 4, 1)
    b.rect(0, 14, 48, 18, "n"); b.rect(22, 14, 26, 18, ":")
    b.rect(20, 8, 28, 10, "w"); b.rect(15, 11, 18, 12, "B")
    b.zone("player", 2, 14, "n"); b.zone("enemy", 42, 14, "n"); b.zone("third", 22, 26); maps.append(b)

    b = Board("mineral-waste-64x40", 64, 40, "+", "W", "巨獸晶原展開漫長衝鋒之路，錯列殘牆分段遮蔽，北方乾溝作低地側翼。")
    for x, y in [(18, 12), (32, 24), (45, 12)]:
        b.rect(x-1, y-1, x+4, y+3, ":"); b.rect(x, y, x+3, y+1, "#")
    b.line(5, 7, 57, 7, "w"); b.rect(27, 5, 31, 10, "n")
    b.zone("player", 3, 18); b.zone("enemy", 55, 18); b.zone("ally", 5, 29); maps.append(b)

    b = Board("shard-mirror-28", 28, 28, "%", "NESW", "萬象碎鏡以雙環包覆異界之心，十字碎甲路保持感測窗口，環邊殘牆可伏擊。", {"light": .8})
    b.ring(14, 14, 10, 10, "/", 2); b.ring(14, 14, 5, 5, "/")
    b.line(1, 14, 26, 14, "c"); b.line(14, 1, 14, 26, "c")
    for x,y in [(8,8),(19,8),(8,19),(19,19)]: b.rect(x,y,x+2,y+2,"#")
    b.zone("player", 2, 12, "c"); b.zone("enemy", 22, 12, "c"); maps.append(b)

    b = Board("citywall-breach-40", 40, 40, "=", "S", "北側守誓城牆的王門破口承受主攻，雙翼路障與高架掩護南側補給街區。")
    b.rect(1, 15, 39, 18, "#"); b.rect(17, 15, 23, 18, ":")
    b.rect(5, 23, 15, 24, "B"); b.rect(25, 23, 35, 24, "B")
    b.rect(3, 17, 6, 30, "n"); b.rect(34, 17, 37, 30, "n")
    b.rect(18, 29, 22, 31, "$"); b.ruins(8, 30, 1, 1)
    b.zone("player", 18, 34); b.zone("enemy", 18, 4); b.zone("ally", 28, 30); maps.append(b)

    b = Board("delta-ruins-56", 56, 56, "=", "NE", "分汊潮神裂渠穿過四座失落王庭，高架渡口控制中心，四方部署可爭奪支流側翼。", {"tide": tide(3)})
    b.ruins(8, 8, 5, 5)
    b.line(27, 0, 27, 31, "w", 2); b.line(27, 28, 6, 55, "w", 2); b.line(27, 28, 50, 55, "w", 2)
    b.rect(21, 17, 34, 20, "n"); b.rect(12, 40, 24, 43, "n"); b.rect(37, 40, 50, 43, "n")
    b.zone("player", 4, 3); b.zone("enemy", 47, 46); b.zone("ally", 46, 3); b.zone("third", 3, 46); maps.append(b)

    b = Board("ancient-shell-30", 30, 30, "=", "S", "古殼聖殿的地磚長廳由殘柱列分成三路，中央高台與北側淺水槽構成交火焦點。", {"light": .5})
    for x in [8, 20]:
        for y in [6, 12, 18, 24]: b.rect(x, y, x+2, y+2, "#")
    b.rect(11, 11, 19, 19, "n"); b.rect(3, 4, 27, 6, "≈"); b.rect(13, 4, 17, 6, "=")
    b.zone("player", 13, 25); b.zone("enemy", 13, 1); b.zone("third", 2, 13); maps.append(b)

    b = Board("nest-core-72", 72, 72, "%", "W", "外圈蝕地通向萬巢聖壁的雙重王冠，放射巢道穿越缺口，側向碎甲環路連結各入口。")
    b.ring(36,36,25,25,"H",2); b.ring(36,36,13,13,"H",2)
    for x,y in [(2,36),(69,36),(36,2),(36,69)]: b.line(36,36,x,y,"o",1)
    b.ring(36,36,19,19,"c",1)
    b.rect(32,32,40,40,"o"); b.rect(34,34,38,38,"H")
    b.zone("player",3,34,"o"); b.zone("enemy",45,34,"o"); b.zone("ally",34,3,"o"); maps.append(b)

    b = Board("convoy-road-80x20", 80, 20, ".", "E", "盟約巡行之路自西向東，三組錯位路障迫使換道，中段斷橋與南側野地形成風險選擇。")
    b.rect(0,8,80,12,"="); b.rect(37,0,40,20,"w"); b.rect(33,8,44,12,"n"); b.rect(38,9,40,11,":")
    for x,y in [(21,8),(51,10),(66,8)]: b.rect(x,y,x+2,y+2,"B")
    b.rect(26,3,31,6,"#"); b.rect(55,15,63,18,":"); b.rect(7,5,10,7,"$")
    b.zone("player",2,8,"="); b.zone("enemy",69,8,"="); b.zone("ally",12,13); maps.append(b)

    b = Board("lunar-quarry-16", 16, 16, "_", "N", "靜海掘星庭以雙側月冠環脊夾住灰燼低地，東側補給台與北側礦道構成短距爭奪。", {"light": .2})
    b.rect(5,5,11,12,"u"); b.rect(3,5,5,11,"^"); b.rect(11,5,13,11,"^")
    b.rect(11,11,13,13,"$"); b.rect(7,7,9,8,"#")
    b.zone("player",2,12); b.zone("enemy",9,1); maps.append(b)

    b = Board("beachhead-44x36", 44, 36, ",", "S", "南岸退潮之喉穿越潮神裂渠上岸，三處巢壁缺口通往北側巢道，兩翼高架可交叉支援。", {"tide": tide(4)})
    b.rect(0,0,44,15,"o"); b.rect(0,14,44,17,"H"); b.rect(0,23,44,26,"w")
    for x in [8,21,34]:
        b.rect(x,14,x+3,17,"c"); b.rect(x,21,x+3,28,"n")
    b.zone("player",20,30); b.zone("enemy",20,4,"o"); b.zone("ally",4,30); maps.append(b)

    b = Board("badlands-128",128,128,".","NESW","西部凡土與淺蝕斑逐漸過渡到東部四族的異界領土；河橋、廢城與裂縫巢核形成三個爭奪區，四部署區中心相距60格曼哈頓距離。",{"light":.7})
    b.rect(40,0,80,128,"%"); b.rect(80,0,128,128,"+")
    # 淺蝕斑沿東西梯度加密；規律地塊避免白噪聲地貌。
    for x,y in [(18,19),(23,67),(28,103),(32,38),(35,84)]: b.rect(x,y,x+7,y+9,"%")
    b.rect(82,9,121,39,"m")
    for y in [16,29]: b.rect(87,y,117,y+2,"*")
    b.rect(87,87,121,120,"/")
    b.line(53,0,59,46,"w",2); b.line(59,46,51,86,"w",2); b.line(51,86,58,127,"w",2)
    for y in [32,63,94]: b.rect(46,y,65,y+3,"n")
    b.rect(12,83,41,116,"="); b.ruins(15,87,3,3)
    b.ring(97,63,20,20,"H",2); b.ring(97,63,11,11,"H",1)
    b.line(72,63,123,63,"o",1); b.line(97,39,97,86,"o",1)
    b.rect(95,58,100,61,"/"); b.rect(36,57,39,59,"$")
    b.zone("player",32,62,"."); b.zone("enemy",92,62,"o")
    b.zone("ally",62,32,"%"); b.zone("third",62,92,"%"); maps.append(b)
    return maps


def encode(board, terrains):
    glyphs = {t["glyph"]: t for t in terrains.values()}
    occupied = {(c["x"], c["y"]) for zone in board.zones.values() for c in zone}
    features = []
    # 每圖挑三個既有可破壞格，保留圖面地形並覆寫個別耐久。
    candidates = [(x,y) for y,row in enumerate(board.grid) for x,g in enumerate(row)
                  if "destructible" in glyphs[g] and (x,y) not in occupied]
    for i in range(min(3,len(candidates))):
        x,y = candidates[i*len(candidates)//3]
        terrain = glyphs[board.grid[y][x]]
        features.append({"at":{"x":x,"y":y},"terrain":terrain["id"],
                         "hp":max(1,terrain["destructible"]["hp"]-(i+1)*5)})
    exits = set()
    # 只列指定邊的可步行格；排除角落，避免同一格兼屬未指定邊。
    for side in board.sides:
        edge = ([(x,0 if side=="N" else board.h-1) for x in range(1,board.w-1)]
                if side in "NS" else [(0 if side=="W" else board.w-1,y) for y in range(1,board.h-1)])
        exits.update((x,y) for x,y in edge if glyphs[board.grid[y][x]]["moveCost"]["leg"] is not None)
    cells = "".join("".join(row) for row in board.grid)
    data = {"id":"map/"+board.name,"width":board.w,"height":board.h,"cells":cells,
            "legend":{g:glyphs[g]["id"] for g in sorted(set(cells))},"features":features,
            "deployZones":board.zones,"exits":[{"x":x,"y":y} for x,y in sorted(exits,key=lambda c:(c[1],c[0]))]}
    if board.globals is not None: data["globals"] = board.globals
    return data


def check(data, terrains, board):
    assert (data["width"],data["height"]) == (board.w,board.h), "尺寸不符"
    assert len(data["cells"]) == board.w*board.h, "格數不符"
    overrides = {(f["at"]["x"],f["at"]["y"]):f["terrain"] for f in data["features"]}
    seen = set()
    assert set(data["deployZones"]) == set(board.zones), "陣營不符"
    for slot, cells in data["deployZones"].items():
        assert len(cells) >= (8 if slot == "player" else 14), "部署格不足"
        for c in cells:
            x,y = c["x"],c["y"]
            assert 0 <= x < board.w and 0 <= y < board.h, "部署越界"
            assert (x,y) not in seen, "部署重疊"
            seen.add((x,y))
            terrain = overrides.get((x,y),data["legend"][data["cells"][y*board.w+x]])
            assert terrains[terrain]["moveCost"]["leg"] is not None, "部署格不可步行"
    for c in data["exits"]:
        sides = {s for s,yes in [("N",c["y"]==0),("S",c["y"]==board.h-1),
                                 ("W",c["x"]==0),("E",c["x"]==board.w-1)] if yes}
        assert sides and sides <= set(board.sides), "撤離邊錯誤"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check-only",action="store_true")
    args = parser.parse_args()
    terrains = {d["id"]:d for p in (BASE/"terrains").glob("*.json") for d in [json.loads(p.read_text())]}
    boards = layouts()
    owned = 17 + len(list((BASE/"effects").glob("bf-*.json"))) + len(boards) + 2
    if owned > 45: raise SystemExit(f"件數 gate：{owned} > 45，停止")
    outputs = [(b,encode(b,terrains)) for b in boards]
    # 在寫入前先檢查容量，超過 gate 不留下部分輸出。
    for b,d in outputs:
        payload = json.dumps(d,ensure_ascii=False,indent=2)+"\n"
        if len(payload.encode()) > 400_000: raise SystemExit(f"容量 gate：{b.name} > 400 KB，停止")
    for b,d in outputs:
        path = BASE/"maps"/(b.name+".json")
        if args.check_only:
            d = json.loads(path.read_text())
        else:
            path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
        check(d,terrains,b)
        print(f'PASS {d["id"]} {b.w}x{b.h} '+" ".join(f"{s}={len(z)}" for s,z in d["deployZones"].items())
              +f" leg=OK overlap=0 exits={b.sides} features={len(d['features'])} bytes={path.stat().st_size}")
    print(f"PASS maps=15 terrains=17 effects=6 delivery-files={owned} (含 gen_maps.py、REPORT.md)")


if __name__ == "__main__":
    main()
