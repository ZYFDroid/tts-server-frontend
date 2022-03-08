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
            >
              <el-option
                v-for="item in actors"
                :key="item"
                :label="item"
                :value="item"
              >
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
                :key="item[1]"
                :label="item[0]"
                :value="item[1]"
              >
                <div class="linearvertical">
                  <div
                    class="linearhorizon"
                    style="justify-content: space-between"
                  >
                    <div>
                      {{ item[0] }}
                    </div>
                    <div
                      style="
                        flex-grow: 1;
                        padding-left: 12px;
                        padding-right: 12px;
                        color: #777777;
                        font-weight: thin;
                        font-size: 9px;
                      "
                    >
                      {{ item[2] }}
                    </div>
                    <div style="color: #8492a6; font-size: 13px">
                      {{ item[1] }}
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
                :key="item"
                :label="item"
                :value="item"
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
            <el-button @click="download" :icon="btnloading ? 'el-icon-loading' : 'el-icon-download'"
              :disabled="btnloading">下载</el-button>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { apiget,playAudio } from "./plugins/common";
import axios from "axios";
export default {
  name: "app",
  components: {},
  mounted() {
    apiget("meta/actor.json", {}, (code, msg, data) => {
      if (code == 200) {
        this.actors = data.data;
      } else {
        this.$message.error("加载CV列表失败");
      }
    });
    apiget("meta/quality.json", {}, (code, msg, data) => {
      if (code == 200) {
        this.composeQualities = data.data;
      } else {
        this.$message.error("加载格式列表失败");
      }
    });
    apiget("meta/style.json", {}, (code, msg, data) => {
      if (code == 200) {
        this.voiceStyles = data.data;
      } else {
        this.$message.error("加载风格列表失败");
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
        informant: "zh-CN-YunxiNeural",
        style: "default",
        rate: 1, //0-3
        pitch: 1, //0-2
        quality: "audio-48khz-192kbitrate-mono-mp3",
        text: "",
      },
    };
  },
  methods: {
    listen() {
      this.btnloading=true;
      this.preprocessData();
      this.getVoiceData()
        .then((blobdata) => {
          
          this.btnloading=false;
          playAudio(blobdata);
        })
        .catch((err) => {
          this.btnloading=false;
          this.$message.error(err.message);
        });
    },
    download() {
      this.btnloading=true;
      this.preprocessData();
      this.getVoiceData()
        .then((blobdata) => {
          this.btnloading=false;
          this.downloadBlob(blobdata);
        })
        .catch((err) => {
          this.btnloading=false;
          this.$message.error(err.message);
        });
    },
    preprocessData() {
      this.postdata.text = encodeURI(this.inputText).replace("+", "%20");
    },
    getVoiceData(isDownload) {
      return new Promise((success, fail) => {
        if (this.postdata.text.length < 1) {
          fail(
             {
              message: "请输入要合成的文本",
            }
          );
          return;
        }
        axios
          .post("tts-ms", this.postdata, {
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
