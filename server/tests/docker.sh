if [ ! -d docker ]; then
    git clone https://github.com/ByDSA/docker-node-git docker
    ln -s ../files docker/files
    ln -s ../files/testing/docker.env docker/.env
fi
cd docker
sudo docker-compose up --build
