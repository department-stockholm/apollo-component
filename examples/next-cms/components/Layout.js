import Head from "next/head";
import Router, { withRouter } from "next/router";
import { Layout as AntLayout, Menu, Icon } from "antd";
const { Header, Content, Footer, Sider } = AntLayout;

export const Layout = ({ children }) => (
  <AntLayout>
    <Head>
      <title>CMS</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/antd/2.9.3/antd.min.css"
      />
    </Head>
    <Navigation />
    <AntLayout style={{ marginLeft: 200 }}>
      <Header style={{ background: "#fff", padding: 0 }} />
      <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
        {children}
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <Credits />
      </Footer>
    </AntLayout>
  </AntLayout>
);

export const Navigation = withRouter(({ router }) => (
  <Sider
    collapsible
    style={{ overflow: "auto", height: "100vh", position: "fixed", left: 0 }}
  >
    <Logo />
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={[router.asPath]}
      onSelect={({ key }) => Router.push(key)}
    >
      <Menu.Item key="/">
        <Icon type="compass" />
        <span className="nav-text">Dashboard</span>
      </Menu.Item>
      <Menu.Item key="/posts">
        <Icon type="file" />
        <span className="nav-text">Posts</span>
      </Menu.Item>
      <Menu.Item key="/assets">
        <Icon type="upload" />
        <span className="nav-text">Assets</span>
      </Menu.Item>
      <Menu.Item key="/users">
        <Icon type="user" />
        <span className="nav-text">Users</span>
      </Menu.Item>
    </Menu>
  </Sider>
));

const Credits = ({}) => "© Department 2017";

const Logo = ({}) => (
  <div className="logo">
    <style jsx>{`
      .logo {
        height: 32px;
        background: #333;
        border-radius: 6px;
        margin: 16px;
      }
    `}</style>
  </div>
);
