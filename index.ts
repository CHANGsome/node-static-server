import * as http from "http";
import {IncomingMessage, ServerResponse} from "http";
import * as p from "path";
import * as fs from "fs";

// 静态服务器：可以相应Get请求，根据不同的请求地址返回不同的文件
const server = http.createServer();
const cacheAge = 3600 * 14 * 365;
// request 的类型：IncomingMessage; response 的类型：ServerResponse
server.on('request', (request: IncomingMessage, response: ServerResponse) => {
  const {method, url: path, headers} = request;
  if (method !== 'GET') {
    // 过滤非GET请求
    response.statusCode = 405;
    response.end();
    return;
  }
  // 根据不同url返回不同资源
  const baseURL = `http://${headers.host}/`;
  const {pathname, search} = new URL(path, baseURL);
  const filenamePath = `public${pathname}`;
  if (pathname === '') {
    const filenamePath = 'public/index.html';
  }
  fs.readFile(p.resolve(__dirname, filenamePath), (err, data) => {
    if (err) {
      // response.setHeader('Content-Type','text/json;charset-utf-8');
      if (err.errno === -2) {
        response.statusCode = 404;
        fs.readFile(p.resolve(__dirname, 'public/404.html'), (err2, data) => {
          response.end(data);
        });
      } else {
        response.statusCode = 500;
        response.end('server busy');
      }

    } else {
      // 缓存静态资源
      response.setHeader('Cache-Control', `public, max-age=${cacheAge}`);
      // 返回文件内容
      response.end(data);
    }
  });
});
server.listen(1234);