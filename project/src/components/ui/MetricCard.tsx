import React from 'react';
import { motion } from 'framer-motion';

type MetricCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  textColor,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`card ${color} overflow-hidden`}
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-white">
          {icon}
        </div>
        <div>
          <h3 className="text-gray-700 text-sm font-medium">{title}</h3>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;