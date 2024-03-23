FROM alpine:latest
RUN apk add npm; \
    npm install -g typescript
WORKDIR /foo/bar/
COPY createSvelte.mts .
RUN npm i create-svelte
RUN tsc createSvelte.mts \
    --target es2017 \
    --module es2022 \
    --moduleResolution node
RUN node createSvelte.mjs
WORKDIR /foo/bar/app
RUN npm i
COPY package.json .
RUN npm i smui-theme
RUN npm i @smui/button
RUN npm i @smui/icon-button
RUN npm i @smui-extra/accordion
RUN npm i @smui/textfield
RUN npm i @smui/select
RUN npm i @smui/switch
RUN npm i @smui/list
RUN npm i @smui/circular-progress
RUN npm i @smui/paper
RUN npm i @smui/tab
RUN npm i @smui/tab-bar
RUN npm i @smui/menu
RUN npm i @smui/snackbar
RUN npm i @smui-extra/badge
RUN npm i ethers6@npm:ethers
RUN npm i idb-keyval
COPY static static
COPY vite.config.ts .