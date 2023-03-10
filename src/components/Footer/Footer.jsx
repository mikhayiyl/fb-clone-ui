import { SendOutlined } from "@material-ui/icons";
import axios from "axios";
import { useRef } from "react";
import { FaFacebook, FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";
import { animateScroll } from "react-scroll/modules";
import { Link as LinkR } from 'react-scroll';
import Rating from "../common/Rating";
import config from "../../config.json"
import {
  FooterContainer,
  FooterWrap,
  FooterLinksContainer,
  FooterLinkWrapper,
  FooterLinkItem,
  FooterLinkTitle,
  FooterLink,
  SocialMedia,
  SocialMediaWrap,
  SocialLogo,
  SocialIcons,
  SocialIconLink,
  WebsiteRights,
  InputContainer,
  Input,
  Button,
} from "./Style";

import { currentUser } from "../services/authService"
import asyncErrors from "../middleware/AsyncErrors";
import { Link, useLocation } from "react-router-dom";
const Footer = () => {
  const textRef = useRef();
  const formRef = useRef();


  const toggleHome = () => {
    animateScroll.scrollToTop();
  };


  const handleSubmit = asyncErrors(async (e) => {
    const url = config.portfolio_url + "/messenger"
    e.preventDefault();
    await axios.post(url, { senderEmail: currentUser().email, text: textRef.current.value, project: "facebook-clone" })
    formRef.current.reset()
  })


  const location = useLocation().pathname.split("/")[1];



  return (
    <FooterContainer>
      <InputContainer ref={formRef} onSubmit={handleSubmit}>

        <Input type='text' placeholder='message' className="form-control" ref={textRef} required maxLength={255} />
        <Button >
          <SendOutlined />
        </Button >
      </InputContainer>
      <FooterWrap>
        <FooterLinksContainer>
          <FooterLinkWrapper>
            <FooterLinkItem>
              <FooterLinkTitle>About Us</FooterLinkTitle>
              <FooterLink to="/">How it Works</FooterLink>
              <FooterLink to="/">Testimonials</FooterLink>
              <FooterLink to="/">Careers</FooterLink>
              <FooterLink to="/">Investors</FooterLink>
              <FooterLink to="/">Terms of Services</FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLinkTitle>Contact Us</FooterLinkTitle>
              <FooterLink to="/">Contact</FooterLink>
              <FooterLink to="/">Support</FooterLink>
              <FooterLink to="/">Destinations</FooterLink>
              <FooterLink to="/">Sponsorship</FooterLink>
              <FooterLink to="/">Terms of Services</FooterLink>
            </FooterLinkItem>
          </FooterLinkWrapper>
          <FooterLinkWrapper>
            <FooterLinkItem>
              <FooterLinkTitle>Videos</FooterLinkTitle>
              <FooterLink to="/">Submit Video</FooterLink>
              <FooterLink to="/">Ambassadors</FooterLink>
              <FooterLink to="/">Agency</FooterLink>
              <FooterLink to="/">Influencer</FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLinkTitle>Social Media</FooterLinkTitle>
              <FooterLink to="/">Facebook</FooterLink>
              <FooterLink to="/">Instagram</FooterLink>
              <FooterLink to="/">Twitter</FooterLink>
              <FooterLink to="/">Pinterest</FooterLink>
              <FooterLink to="/">Github</FooterLink>
            </FooterLinkItem>
          </FooterLinkWrapper>
        </FooterLinksContainer>
        <SocialMedia>
          <SocialMediaWrap>
            <SocialLogo to="" onClick={toggleHome}>
              Mikhayiyl
            </SocialLogo>
            <WebsiteRights>
              Mikhayiyil &copy; copyright {new Date().getFullYear()} All Rights
              Reserved
            </WebsiteRights>
            <SocialIcons>
              <SocialIconLink href="/" target="_blank" aria-label="FaceBook">
                <FaFacebook />
              </SocialIconLink>
              <SocialIconLink href="/" target="_blank" aria-label="Instagram">
                <FaInstagram />
              </SocialIconLink>
              <SocialIconLink href="/" target="_blank" aria-label="Twitter">
                <FaTwitter />
              </SocialIconLink>
              <SocialIconLink href="/" target="_blank" aria-label="Github">
                <FaGithub />
              </SocialIconLink>
            </SocialIcons>
          </SocialMediaWrap>
        </SocialMedia>
      </FooterWrap>
      {location === "help" ? <LinkR to="ratings" smooth="true"
        className="link">

        <Rating />
      </LinkR> :


        <Link to="/help" className="link">
          <Rating />
        </Link>}

    </FooterContainer>
  );
};

export default Footer;
