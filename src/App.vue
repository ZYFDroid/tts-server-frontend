<template>
  <div>
    <el-container style="height: 100vh">
      <el-header style="padding: 0; height: 50px">
        <div class="fillcontent titlebar">
          <i class="el-icon-headset"></i> Microsoft TTS
        </div>
      </el-header>
      <el-main>
        <el-form
          :model="postdata"
          ref="postdata"
          label-width="7em"
          :inline="false"
          size="normal"
        >
          <el-form-item label="合成内容：">
            <el-input v-model="inputText" type="textarea" rows="10"></el-input>
          </el-form-item>
          <el-form-item label="CV：" size="normal">
            <el-select
              v-model="postdata.informant"
              placeholder="请选择"
              
              default-first-option
              @change="reloadStyleList"
            >
              <el-option
                v-for="item in actors"
                :key="item.key"
                :label="item.data.LocalName"
                :value="item.key"
              >
              <div class="linearvertical">
                  <div
                    class="linearhorizon"
                    style="justify-content: space-between"
                  >
                    <div v-if="item.data.Status != 'GA'"><b>（已过时）</b></div>
                    <div>
                      {{item.data.LocalName}}<i>({{ item.data.Gender }})</i>
                    </div>
                    <div style="flex-grow:1;"></div>
                    <div style="color: #8492a6; font-size: 13px">
                      {{ item.data.LocaleName }}
                    </div>
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="风格：" size="normal">
            <el-select
              v-model="postdata.style"
              placeholder="请选择"
              default-first-option
            >
              <el-option
                v-for="item in voiceStyles"
                :key="item.key"
                :label="styledesc[item.key]"
                :value="item.key"
              >
                <div class="linearvertical">
                  <div
                    class="linearhorizon"
                    style="justify-content: space-between"
                  >
                    <div>
                      {{ styledesc[item.key] }}
                    </div>
                    
                    <div style="color: #8492a6; font-size: 13px">
                      {{ item.key }}
                    </div>
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="音调：" size="normal">
            <el-slider
              v-model="postdata.pitch"
              :min="0.01"
              :max="2.0"
              :step="0.01"
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="语速：" size="normal">
            <el-slider
              v-model="postdata.rate"
              :min="0.01"
              :max="3.0"
              :step="0.01"
            >
            </el-slider>
          </el-form-item>
          <el-form-item label="音频流格式：" size="normal">
            <el-select
              v-model="postdata.quality"
              placeholder="请选择"
              default-first-option
            >
              <el-option
                v-for="item in composeQualities"
                :key="item.key"
                :label="item.key"
                :value="item.key"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="listen"
              :icon="btnloading ? 'el-icon-loading' : 'el-icon-video-play'"
              :disabled="btnloading"
              >试听</el-button
            >
            <el-button
              @click="download"
              :icon="btnloading ? 'el-icon-loading' : 'el-icon-download'"
              :disabled="btnloading"
              >下载</el-button
            >
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { apiget, playAudio } from "./plugins/common";
import axios from "axios";
export default {
  name: "app",
  components: {},
  mounted() {
    apiget("ms-tts/informant", {}, (code, msg, data) => {
      if (code == 200) {
        this.sortData(data.data);
        this.actors = data.data;
        this.postdata.informant = this.actors[0].key;
        this.reloadStyleList();
      } else {
        this.$message.error("加载CV列表失败");
      }
    });
   
    apiget("ms-tts/quality", {}, (code, msg, data) => {
      if (code == 200) {
        this.composeQualities = data.data;
      } else {
        this.$message.error("加载格式列表失败");
      }
    });
  },
  data() {
    return {
      composeQualities: [],
      actors: [],
      voiceStyles: [],
      inputText: "",
      btnloading: false,
      postdata: {
        informant: "",
        style: "general",
        rate: 1, //0-3
        pitch: 1, //0-2
        quality: "audio-48khz-192kbitrate-mono-mp3",
        text: "",
      },
      styledesc: {
        general: "默认",
        default: "默认",
        newscast: "新闻播报",
        customerservice: "客服",
        assistant: "助理",
        chat: "闲聊",
        calm: "平静",
        cheerful: "开心",
        sad: "悲伤",
        angry: "愤怒",
        fearful: "害怕",
        disgruntled: "抱怨",
        serious: "严肃",
        affectionate: "撒娇",
        gentle: "温柔",
        lyrical: "抒情",
        embarrassed: "尴尬",
        empathetic: "关切",
        depressed: "沮丧",
        envious:"羡慕",
        "newscast-casual": "新闻播报（休闲）",
        "newscast-formal": "新闻播报（正式）",
        "narration-relaxed": "旁白/朗读 （放松）",
        "narration-professional": "旁白/朗读（正式）",
      },
    };
  },
  methods: {
    reloadStyleList() {
       apiget("ms-tts/style/"+this.postdata.informant, {}, (code, msg, data) => {
      if (code == 200) {
        this.voiceStyles = data.data;
      } else {
        this.$message.error("加载语音风格列表失败");
      }
    });
    },
    listen() {
      this.btnloading = true;
      this.preprocessData();
      this.getVoiceData()
        .then((blobdata) => {
          this.btnloading = false;
          playAudio(blobdata);
        })
        .catch((err) => {
          this.btnloading = false;
          this.$message.error(err.message);
        });
    },
    download() {
      this.btnloading = true;
      this.preprocessData();
      this.getVoiceData()
        .then((blobdata) => {
          this.btnloading = false;
          this.downloadBlob(blobdata);
        })
        .catch((err) => {
          this.btnloading = false;
          this.$message.error(err.message);
        });
    },
    preprocessData() {
      this.postdata.text = encodeURI(this.inputText).replace("+", "%20");
    },
    getVoiceData(isDownload) {
      return new Promise((success, fail) => {
        if (this.postdata.text.length < 1) {
          fail({
            message: "请输入要合成的文本",
          });
          return;
        }
        axios
          .post("/tts-ms", this.postdata, {
            responseType: "blob",
          })
          .then((res) => {
            console.log(res);
            let blob = new Blob([res.data], {
              type: isDownload ? "application/octet-stream" : "audio/mp3",
            });
            success(blob);
          })
          .catch((error) => {
            fail(error);
          });
      });
    },
    downloadBlob(blob) {
      let url = window.URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = "speech" + new Date().getTime() + ".mp3";
      a.click();
      window.URL.revokeObjectURL(url);
    },
    // 对发音人列表进行排序
    sortData(data){
      var currentLanguage = []; // 当前浏览器语言
      var currentAltentiveLanguage = []; //当前浏览器语言，但后面两位不一样
      var normalList = [];// 其它语言，按字母排序
      var deprecated = [];// 被标记为deprecated的语言
      data.sort((a,b) => {
        return a.key.localeCompare(b.key);
      })
      var currentLanguageStr = navigator.language.toLowerCase();
      var currentLanguagePrefix = currentLanguageStr.substring(0,2)+"-";
      for(var i = 0;i<data.length;i++){
        var entry = data[i];
        if(entry.data.Status != "GA"){
          deprecated.push(entry);
        }
        else{
          var lang = entry.data.Locale.toLowerCase();
          if(lang == currentLanguageStr){
            currentLanguage.push(entry);
          }
          else if(lang.startsWith(currentLanguagePrefix)){
            currentAltentiveLanguage.push(entry);
          }else{
            normalList.push(entry);
          }
        }
      }
      while(data.length > 0){data.pop();}
      currentLanguage.forEach((l)=> data.push(l));
      currentAltentiveLanguage.forEach((l)=> data.push(l));
      normalList.forEach((l)=> data.push(l));
      deprecated.forEach((l)=> data.push(l));
    }
  },
};
</script>
<style>
.titlebar {
  background-color: rgb(0, 128, 32);
  height: 100%;
  line-height: 50px;
  padding-left: 30px;
  color: white;
}

.linearhorizon {
  display: flex;
  flex-direction: row;
}
.linearvertical {
  display: flex;
  flex-direction: column;
}
</style>
